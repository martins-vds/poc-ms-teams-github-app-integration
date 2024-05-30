// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConversationState, UserState, TurnContext, ActivityTypes } from 'botbuilder';
import { DialogState } from 'botbuilder-dialogs';
import { DialogBot } from './dialogBot';
import { MainDialog } from '../dialogs/mainDialog';

export class TeamsBot extends DialogBot {
    /**
     * 
     * @param conversationState The conversation state.
     * @param userState The user state.
     * @param dialog The dialog to run.
     */
    constructor(conversationState: ConversationState, userState: UserState, dialog: MainDialog) {
        super(conversationState, userState, dialog);

        this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>) => {
            const membersAdded = context.activity.membersAdded!;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to TeamsBot. Type anything to get logged in. Type \'logout\' to sign-out.');
                }
            }

            await next();
        });
    }

    /**
     * Receives invoke activities with Activity name of 'signin/verifyState'.
     * @param context The TurnContext object.
     * @param state The state object.
     */
    async handleTeamsSigninVerifyState(context: TurnContext, state: any): Promise<void> {
        console.log('Running dialog with signin/verifystate from an Invoke Activity.');
        await this.dialog.run(context, this.dialogState);
    }

    /**
     * Receives invoke activities with Activity name of 'signin/tokenExchange'.
     * @param context The TurnContext object.
     * @param state The state object.
     */
    async handleTeamsSigninTokenExchange(context: TurnContext, state: any): Promise<void> {
        console.log('Running dialog with signin/tokenExchange from an Invoke Activity.');
        await this.dialog.run(context, this.dialogState);
    }
}
