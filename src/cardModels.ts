/**
 * Adaptive Card data model. Properties can be referenced in an adaptive card via the `${var}`
 * Adaptive Card syntax.
 */
export interface NotificationData {
  title: string;
  appName: string;
  description: string;
  notificationUrl: string;
}

export interface CardData {
  title: string;
  body: string;
}
