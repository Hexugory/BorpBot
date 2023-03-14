import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class UniqueRoles extends Model<InferAttributes<UniqueRoles>, InferCreationAttributes<UniqueRoles>> {
    declare readonly role_id: string
    declare guild_id: string
    declare role_name: string
    declare emoji: CreationOptional<string>
    declare description: CreationOptional<string>
}