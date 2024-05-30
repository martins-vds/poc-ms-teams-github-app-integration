import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;
import config from "./config";
import { HelloWorldCommandHandler } from "../commands/helloWorldCommandHandler";
import { BlobStore } from "../store/blobStore";

// Create bot.
export const notificationApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
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
