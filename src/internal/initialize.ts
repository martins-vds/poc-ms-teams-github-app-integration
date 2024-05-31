import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { HelloWorldCommandHandler } from "../commands/helloWorldCommandHandler";
import { BlobStore } from "../store/blobStore";
import { ConfigurationBotFrameworkAuthentication, TeamsSSOTokenExchangeMiddleware, CloudAdapter, ConversationState, MemoryStorage } from "botbuilder";
import { authConfig } from "../authConfig";

const memoryStorage = new MemoryStorage();

// Create conversation and user state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(authConfig);

const tokenExchangeMiddleware = new TeamsSSOTokenExchangeMiddleware(memoryStorage, config.connectionName);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.use(tokenExchangeMiddleware);
adapter.onTurnError = async (context, error) => {
  const errorMsg = error.message
      ? error.message
      : `Oops. Something went wrong!`;
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Clear out state
  await conversationState.delete(context);
  // Send a message to the user
  await context.sendActivity(errorMsg);

  // Note: Since this Messaging Extension does not have the messageTeamMembers permission
  // in the manifest, the bot will not be allowed to message users.

  // Uncomment below commented line for local debugging.
  // await context.sendActivity(`Sorry, it looks like something went wrong. Exception Caught: ${errorMsg}`);
};

// Create bot.
export const notificationApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  adapter: adapter,
  // Enable notification
  notification: {
    enabled: true,
    store: new BlobStore(config.blobConnectionString, config.blobContainerName),
  },  
  command: {
    enabled: true,
    commands: [new HelloWorldCommandHandler()],
  },  
});
