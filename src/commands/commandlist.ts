import { BlacklistCommand } from "./blacklist";
import { BlameCommand } from "./blame";
import { DeploySlashCommand } from "./deployslash";
import { GlobalBlacklistCommand } from "./gblacklist";
import { KillCommand } from "./kill";
import { RandomCaseCommand } from "./randomcase";
import { RemindMeCommand } from "./remindme";

export const CommandList = [
    new GlobalBlacklistCommand(),
    new RandomCaseCommand(),
    new KillCommand(),
    new DeploySlashCommand(),
    new BlacklistCommand(),
    new BlameCommand(),
    new RemindMeCommand()
];