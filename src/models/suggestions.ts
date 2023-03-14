import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class Suggestions extends Model<InferAttributes<Suggestions>, InferCreationAttributes<Suggestions>> {
    declare readonly id: CreationOptional<number>
    declare guild_id: string
    declare user_id: string
    declare anonymous: boolean
    declare suggestion: string
}