import { TeamsActivityHandler, TurnContext, ConversationState, UserState } from 'botbuilder';
import { MainDialog } from '../dialogs/mainDialog';

export class DialogBot extends TeamsActivityHandler {
    protected conversationState: ConversationState;
    protected userState: UserState;
    protected dialog: MainDialog;
    protected dialogState: any;

    constructor(conversationState: ConversationState, userState: UserState, dialog: MainDialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
            console.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            await next();
        });
    }

    /**
     * Override the TeamsActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context: TurnContext): Promise<void> {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}
