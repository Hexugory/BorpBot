import { AddToggleRoleCommand } from "./addtogglerole";
import { DeployToggleCommand } from "./deploytoggle";
import { DeployUniqueCommand } from "./deployunique";
import { RandomCaseCommand } from "./randomcase";
import { RemoveToggleRoleCommand } from "./removetogglerole";
import { SuggestCommand } from "./suggest";
import { WikiCommand } from "./wiki";

export const SlashCommandList = [
    new AddToggleRoleCommand(),
    new DeployToggleCommand(),
    new RandomCaseCommand(),
    new RemoveToggleRoleCommand(),
    new SuggestCommand(),
    new WikiCommand(),
    new DeployUniqueCommand()
];