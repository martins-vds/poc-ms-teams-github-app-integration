@maxLength(20)
@minLength(4)
@description('Used to generate names for all resources in this file')
param resourceBaseName string

@description('Required when create Azure Bot service')
param botAadAppClientId string

@secure()
@description('Required by Bot Framework package in your bot project')
param botAadAppClientSecret string

param githubConnectionName string
param githubClientId string
@secure()
param githubClientSecret string

param webAppSKU string

@maxLength(42)
param botDisplayName string

param workspaceName string = resourceBaseName
param appInsightsName string = resourceBaseName
param serverfarmsName string = resourceBaseName
param webAppName string = resourceBaseName
param notificationStorageName string = resourceBaseName
param location string = resourceGroup().location

resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  location: location
  name: workspaceName
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  location: location
  name: appInsightsName
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
  }
}

resource notificationStorage 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  location: location
  name: notificationStorageName
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}

resource notificationBlobService 'Microsoft.Storage/storageAccounts/blobServices@2023-04-01' = {
  parent: notificationStorage
  name: 'default'
}

resource notificationContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-04-01' = {
  parent: notificationBlobService
  name: 'notifications'
  properties: {
    publicAccess: 'None'
  }
}

// Compute resources for your Web App
resource serverfarm 'Microsoft.Web/serverfarms@2021-02-01' = {
  kind: 'linux'
  location: location
  name: serverfarmsName
  sku: {
    name: webAppSKU
  }
  properties: {
    reserved: true
  }
}

// Web App that hosts your bot
resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  location: location
  name: webAppName
  properties: {
    serverFarmId: serverfarm.id
    httpsOnly: true    
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'node|18-lts'      
      appSettings: [
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1' // Run Azure App Service from a package file
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18' // Set NodeJS version to 18.x for your site
        }
        {
          name: 'RUNNING_ON_AZURE'
          value: '1'
        }
        {
          name: 'BOT_ID'
          value: botAadAppClientId
        }
        {
          name: 'BOT_PASSWORD'
          value: botAadAppClientSecret
        }
        {
          name: 'CONNECTION_NAME'
          value: githubConnectionName
        }
        {
          name: 'BOT_DOMAIN'
          value: ''          
        }
        { 
          name: 'AAD_APP_OAUTH_AUTHORITY_HOST'
          value: environment().authentication.loginEndpoint
        }
        { 
          name: 'AAD_APP_CLIENT_ID'
          value: botAadAppClientId
        }
        {
          name: 'AAD_APP_CLIENT_SECRET'
          value: botAadAppClientSecret
        }        
        {
          name: 'AAD_APP_TENANT_ID'
          value: 'common'
        }
        {
          name: 'MICROSOFT_APP_TENANT_ID'
          value: 'common'
        }
        { 
          name: 'MICROSOFT_APP_TYPE'
          value: 'MultiTenant'
        }
        {
          name: 'SECRET_AAD_APP_CLIENT_SECRET'
          value: botAadAppClientSecret
        }
        {
          name: 'BLOB_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${notificationStorage.name};AccountKey=${notificationStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        { 
          name: 'BLOB_CONTAINER_NAME'
          value: 'notifications'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'APPINSIGHTS_PROFILERFEATURE_VERSION'
          value: '1.0.0'
        }
        { 
          name: 'APPINSIGHTS_SNAPSHOTFEATURE_VERSION' 
          value: '1.0.0' 
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~2'
        }
        {
          name: 'DiagnosticServices_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'InstrumentationEngine_EXTENSION_VERSION'
          value: 'disabled'
        }
        {
          name: 'SnapshotDebugger_EXTENSION_VERSION'
          value: 'disabled'
        }
        {
          name: 'XDT_MicrosoftApplicationInsights_NodeJS'
          value: '1'
        }
      ]
      ftpsState: 'FtpsOnly'
    }
  }
}

// Register your web service as a bot with the Bot Framework
module azureBotRegistration './botRegistration/azurebot.bicep' = {
  name: 'Azure-Bot-registration'
  params: {
    resourceBaseName: resourceBaseName
    botAadAppClientId: botAadAppClientId
    botAppDomain: webApp.properties.defaultHostName
    botDisplayName: botDisplayName
    githubConnectionName: githubConnectionName
    githubClientId: githubClientId
    githubClientSecret: githubClientSecret
    appInsightsInstrumentationKey: appInsights.properties.InstrumentationKey
  }
}

// The output will be persisted in .env.{envName}. Visit https://aka.ms/teamsfx-actions/arm-deploy for more details.
output BOT_AZURE_APP_SERVICE_RESOURCE_ID string = webApp.id
output BOT_DOMAIN string = webApp.properties.defaultHostName
output BLOB_CONNECTION_STRING string = 'DefaultEndpointsProtocol=https;AccountName=${notificationStorage.name};AccountKey=${notificationStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
output BLOB_CONTAINER_NAME string = 'notifications'
