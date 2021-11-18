/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.5.0-SNAPSHOT
 *
 */
import { Fluence, FluencePeer } from '@fluencelabs/fluence';
import {
    CallParams,
    callFunction,
    registerService,
} from '@fluencelabs/fluence/dist/internal/compilerSupport/v2';


// Services

export interface MoveSaverDef {
    readMoves: (ceramicId: string, callParams: CallParams<'ceramicId'>) => { moves: string[]; } | Promise<{ moves: string[]; }>;
    saveMoves: (move_json: string, ceramicId: string, callParams: CallParams<'move_json' | 'ceramicId'>) => { ceramicId: string; } | Promise<{ ceramicId: string; }>;
}
export function registerMoveSaver(service: MoveSaverDef): void;
export function registerMoveSaver(serviceId: string, service: MoveSaverDef): void;
export function registerMoveSaver(peer: FluencePeer, service: MoveSaverDef): void;
export function registerMoveSaver(peer: FluencePeer, serviceId: string, service: MoveSaverDef): void;
       

export function registerMoveSaver(...args: any) {
    registerService(
        args,
        {
    "defaultServiceId" : "movesaver",
    "functions" : [
        {
            "functionName" : "readMoves",
            "argDefs" : [
                {
                    "name" : "ceramicId",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        },
        {
            "functionName" : "saveMoves",
            "argDefs" : [
                {
                    "name" : "move_json",
                    "argType" : {
                        "tag" : "primitive"
                    }
                },
                {
                    "name" : "ceramicId",
                    "argType" : {
                        "tag" : "primitive"
                    }
                }
            ],
            "returnType" : {
                "tag" : "primitive"
            }
        }
    ]
}
    );
}
      
// Functions

