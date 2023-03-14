import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class ChannelTags extends Model<InferAttributes<ChannelTags>, InferCreationAttributes<ChannelTags>> {
    declare readonly channel_id: string
    declare guild_id: string
    declare meme: CreationOptional<boolean>
    declare x: CreationOptional<boolean>
    declare suggest: CreationOptional<boolean>
    declare voice: CreationOptional<boolean>
    declare log: CreationOptional<boolean>
}