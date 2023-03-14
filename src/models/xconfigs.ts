import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "sequelize";

export class XConfigs extends Model<InferAttributes<XConfigs>, InferCreationAttributes<XConfigs>> {
    declare readonly channel_id: string
    declare activity_time: CreationOptional<number>
    declare activity_ratio: CreationOptional<number>
    declare minimum: CreationOptional<number>
    declare maximum: CreationOptional<number>
}