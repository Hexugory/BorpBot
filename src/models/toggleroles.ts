import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class ToggleRoles extends Model<InferAttributes<ToggleRoles>, InferCreationAttributes<ToggleRoles>> {
    declare readonly role_id: string
    declare guild_id: string
    declare role_name: string
}