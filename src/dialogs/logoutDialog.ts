import { ActivityTypes, CloudAdapter, TurnContext } from 'botbuilder';
import { ComponentDialog, DialogContext } from 'botbuilder-dialogs';

export class LogoutDialog extends ComponentDialog {
    private connectionName: string;

    constructor(id: string, connectionName: string) {
        super(id);
        this.connectionName = connectionName;
    }

    public async onBeginDialog(innerDc: DialogContext, options?: any): Promise<any> {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }

        return await super.onBeginDialog(innerDc, options);
    }

    public async onContinueDialog(innerDc: DialogContext): Promise<any> {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }

        return await super.onContinueDialog(innerDc);
    }

    private async interrupt(innerDc: DialogContext): Promise<any> {
        if (innerDc.context.activity.type === ActivityTypes.Message) {
            const text = innerDc.context.activity.text.toLowerCase();
            if (text === 'logout') {
                const userTokenClient = innerDc.context.turnState.get((innerDc.context.adapter as CloudAdapter).UserTokenClientKey);

                const { activity } = innerDc.context;
                await userTokenClient.signOutUser(activity.from.id, this.connectionName, activity.channelId);

                await innerDc.context.sendActivity('You have been signed out.');
                return await innerDc.cancelAllDialogs();
            }
        }
    }
}
