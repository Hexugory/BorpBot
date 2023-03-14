import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class CommandBlacklist extends Model<InferAttributes<CommandBlacklist>, InferCreationAttributes<CommandBlacklist>> {
    declare user_id: string
    declare guild_id: string
    declare blacklist: CreationOptional<string>
}