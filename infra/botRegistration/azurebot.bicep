@maxLength(20)
@minLength(4)
@description('Used to generate names for all resources in this file')
param resourceBaseName string

@maxLength(42)
param botDisplayName string

param botServiceName string = resourceBaseName
param botServiceSku string = 'F0'
param botAadAppClientId string
param botAppDomain string

param githubConnectionName string
param githubClientId string
@secure()
param githubClientSecret string

param appInsightsInstrumentationKey string

// Register your web service as a bot with the Bot Framework
resource botService 'Microsoft.BotService/botServices@2021-03-01' = {
  kind: 'azurebot'
  location: 'global'
  name: botServiceName
  properties: {
    displayName: botDisplayName
    endpoint: 'https://${botAppDomain}/api/messages'
    msaAppId: botAadAppClientId
    developerAppInsightKey: appInsightsInstrumentationKey
  }
  sku: {
    name: botServiceSku
  }
}

// Connect the bot service to Microsoft Teams
resource botServiceMsTeamsChannel 'Microsoft.BotService/botServices/channels@2021-03-01' = {
  parent: botService
  location: 'global'
  name: 'MsTeamsChannel'
  properties: {
    channelName: 'MsTeamsChannel'
  }
}

resource botServiceOauthConfig 'Microsoft.BotService/botServices/connections@2022-09-15' = {
  parent: botService
  location: 'global'
  name: githubConnectionName
  properties: {
    name: githubConnectionName
    serviceProviderDisplayName: 'GitHub'
    serviceProviderId: 'd05eaacf-1593-4603-9c6c-d4d8fffa46cb'
    clientId: githubClientId
    clientSecret: githubClientSecret
  }
}
