import { Gateway, GatewayEventHandler } from '../index.ts'
import { Guild } from '../../structures/guild.ts'
import { GuildPayload } from '../../types/guild.ts'
import { GuildChannelPayload } from '../../types/channel.ts'

export const guildCreate: GatewayEventHandler = async (
  gateway: Gateway,
  d: GuildPayload
) => {
  const hasGuild: Guild | undefined = await gateway.client.guilds.get(d.id)
  await gateway.client.guilds.set(d.id, d)
  const guild = ((await gateway.client.guilds.get(d.id)) as unknown) as Guild

  if (d.members !== undefined) await guild.members.fromPayload(d.members)

  if (d.channels !== undefined) {
    for (const ch of d.channels as GuildChannelPayload[]) {
      ch.guild_id = d.id
      await gateway.client.channels.set(ch.id, ch)
    }
  }

  await guild.roles.fromPayload(d.roles)

  if (d.presences !== undefined) await guild.presences.fromPayload(d.presences)

  if (d.voice_states !== undefined)
    await guild.voiceStates.fromPayload(d.voice_states)

  if (hasGuild === undefined) {
    // It wasn't lazy load, so emit event
    gateway.client.emit('guildCreate', guild)
  } else gateway.client.emit('guildLoaded', guild)
}
