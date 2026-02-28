/**
 * Discord webhook URL detection and payload formatting.
 * Discord expects POST body: { content?: string, embeds?: Embed[] }
 * At least one of content, embeds, file, or poll is required.
 * @see https://discord.com/developers/resources/webhook#execute-webhook
 */

const DISCORD_WEBHOOK_HOSTS = [
  "discord.com",
  "www.discord.com",
  "discordapp.com",
  "www.discordapp.com",
];

/**
 * Check if a webhook URL is a Discord incoming webhook URL.
 * Format: https://discord.com/api/webhooks/{id}/{token}
 */
export function isDiscordWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!DISCORD_WEBHOOK_HOSTS.includes(host)) return false;
    const path = parsed.pathname;
    return /^\/api\/webhooks\/\d+\/[\w-]+$/i.test(path);
  } catch {
    return false;
  }
}

/** Notification-like object used to build Discord payload */
export interface NotificationPayload {
  title: string;
  message: string;
  url?: string | null;
  type?: string;
  createdAt?: Date | string;
}

/** Application base URL for "open for more details" link in Discord embeds */
const APP_BASE_URL = "https://www.learning-system-management.online";

/** Suffix appended to Discord embed description: clickable link to open the site */
const DISCORD_MORE_DETAILS_SUFFIX = `\n\n[Open learning-system-management.online for more details](${APP_BASE_URL})`;

/** Discord embed color by notification type (decimal) */
const EMBED_COLORS: Record<string, number> = {
  INFO: 0x3498db, // blue
  WARNING: 0xe67e22, // orange
  ALERT: 0xe74c3c, // red
};

/**
 * Build a Discord webhook payload from a notification.
 * Uses embeds for rich display: title, description, color, optional link, timestamp.
 * Appends a clickable link to open the application for more details.
 */
export function notificationToDiscordPayload(
  notification: NotificationPayload,
): Record<string, unknown> {
  const type = (notification.type ?? "INFO").toUpperCase();
  const color = EMBED_COLORS[type] ?? EMBED_COLORS.INFO;

  const maxDescLength = 4096 - DISCORD_MORE_DETAILS_SUFFIX.length;
  const description =
    notification.message.slice(0, maxDescLength) + DISCORD_MORE_DETAILS_SUFFIX;

  const embed: Record<string, unknown> = {
    title: notification.title.slice(0, 256),
    description,
    color,
  };

  // Only set embed URL if it's absolute (Discord requires full URL for clickable title)
  if (
    notification.url &&
    (notification.url.startsWith("http://") ||
      notification.url.startsWith("https://"))
  ) {
    embed.url = notification.url;
  }

  if (notification.createdAt) {
    const date =
      typeof notification.createdAt === "string"
        ? new Date(notification.createdAt)
        : notification.createdAt;
    if (!Number.isNaN(date.getTime())) {
      embed.timestamp = date.toISOString();
    }
  }

  return {
    embeds: [embed],
  };
}
