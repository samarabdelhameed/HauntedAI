// Managed by Kiro
// Factory for creating orchestrator instances with dependencies
// Requirements: 5.1, 5.2, 12.1, 12.2

import { OrchestratorService } from './orchestrator.service';
import { LogEmitterService } from './log-emitter.service';

/**
 * Create an orchestrator instance with all dependencies
 */
export function createOrchestrator(
  updateRoomStatus: (roomId: string, status: string) => Promise<void>,
  rewardUser: (roomId: string, amount: number) => Promise<void>,
  redisUrl?: string,
): { orchestrator: OrchestratorService; logEmitter: LogEmitterService } {
  // Create log emitter service
  const logEmitter = new LogEmitterService(redisUrl);

  // Create orchestrator with log emitter
  const orchestrator = new OrchestratorService(
    async (roomId, agentType, level, message, metadata) => {
      await logEmitter.emitLog(roomId, agentType as any, level as any, message, metadata);
    },
    updateRoomStatus,
    rewardUser,
  );

  return { orchestrator, logEmitter };
}

/**
 * Example usage:
 * 
 * const { orchestrator, logEmitter } = createOrchestrator(
 *   async (roomId, status) => {
 *     await prisma.room.update({ where: { id: roomId }, data: { status } });
 *   },
 *   async (roomId, amount) => {
 *     await tokenService.rewardUser(roomId, amount);
 *   }
 * );
 * 
 * // Execute workflow
 * await orchestrator.executeWorkflow(roomId, userInput);
 * 
 * // Clean up
 * await logEmitter.close();
 */
