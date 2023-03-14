import { InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class BlacklistUsers extends Model<InferAttributes<BlacklistUsers>, InferCreationAttributes<BlacklistUsers>> {
    declare readonly user_id: string
}