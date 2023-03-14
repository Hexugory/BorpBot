import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class Reminders extends Model<InferAttributes<Reminders>, InferCreationAttributes<Reminders>> {
    declare readonly id: CreationOptional<number>
    declare user_id: string
    declare time: Date
    declare reminder: string
}