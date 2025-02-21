import {
  PrismaClient,
} from "@prisma/client";

const rootPrismaClient = generatePrismaClient();
const prismaClients: Record<
  "root" | (Omit<string, "root"> & string),
  typeof rootPrismaClient
> = {
  root: rootPrismaClient,
};
function generatePrismaClient(datasourceUrl?: string) {
  let prismaClientParams: ConstructorParameters<typeof PrismaClient> = [];
  if (typeof datasourceUrl === "string") {
    prismaClientParams = [
      {
        datasourceUrl,
      },
    ];
  }
  const client = new PrismaClient(...prismaClientParams).$extends({
    result: {
      task: {},
    },
    model: {
      // notification: {
      //   async sendNotification(
      //     notificationType: NotificationTypeEnum,
      //     details: string,
      //     sentTo: string,
      //     sentBy: string,
      //     referenceId: string
      //   ) {
      //     const responseNotification = await client.notification.create({
      //       data: {
      //         type: notificationType,
      //         details: details,
      //         sentTo: sentTo,
      //         sentBy: sentBy,
      //         referenceId: referenceId,
      //       },
      //     });
      //     RegisterSocketServices.io
      //       .in(responseNotification.sentTo)
      //       .emit("notification", responseNotification);
      //     return responseNotification;
      //   },
      // },
      // history: {
      //   async createHistory(
      //     userId: string,
      //     historyType: HistoryTypeEnum,
      //     historyMesage: string,
      //     historyData: { oldValue?: string; newValue?: string } | any,
      //     historyRefrenceId: string
      //   ) {
      //     const history = await client.history.create({
      //       data: {
      //         type: historyType,
      //         data: historyData,
      //         createdBy: userId,
      //         referenceId: historyRefrenceId,
      //         message: historyMesage,
      //       },
      //     });
      //     return history;
      //   },
      // },
      // userOrganisation: {
      //   async findAdministrator(organisationId: string) {
      //     return await client.userOrganisation.findMany({
      //       where: {
      //         organisationId,
      //         role: UserRoleEnum.ADMINISTRATOR,
      //         user: {
      //           status: UserStatusEnum.ACTIVE,
      //         },
      //         deletedAt: null,
      //       },
      //     });
      //   },
      // },
      // project: {
      //   async projectProgression(
      //     projectId: string,
      //     tenantId: string,
      //     organisationId: string
      //   ) {
      //     const parentTasks = await client.task.findMany({
      //       where: {
      //         projectId,
      //         deletedAt: null,
      //         parentTaskId: null,
      //       },
      //       include: {
      //         subtasks: {
      //           where: { deletedAt: null },
      //           include: {
      //             subtasks: {
      //               where: { deletedAt: null },
      //               include: {
      //                 subtasks: true,
      //               },
      //             },
      //           },
      //         },
      //       },
      //     });

      //     let completionPecentageOrDuration = 0;
      //     let averagesSumOfDuration = 0;

      //     for (const value of parentTasks) {
      //       const completionPecentage =
      //         (await calculationSubTaskProgression(
      //           value,
      //           tenantId,
      //           organisationId
      //         )) ?? 0;
      //       if (completionPecentage && value.duration) {
      //         completionPecentageOrDuration +=
      //           Number(completionPecentage) * value.duration;
      //       }
      //       averagesSumOfDuration += value.duration * 100;
      //     }
      //     const finalValue =
      //       completionPecentageOrDuration / averagesSumOfDuration;
      //     return finalValue;
      //   },
      // },
      // task: {
      //   // create action (comment-attachment-dependencies)
      //   async canCreate(taskId: string, userId: string) {
      //     const task = await client.task.getTaskById(taskId);
      //     const userRoles = await client.user.getUserRoleBasedOnProject(userId);
      //     const allowedRoles: UserRoleEnum[] = [
      //       UserRoleEnum.ADMINISTRATOR,
      //       UserRoleEnum.PROJECT_MANAGER,
      //     ];

      //     const isAssignedToTask = task.assignedUsers.some(
      //       (assignedUser) => assignedUser.user.userId === userId
      //     );
      //     return (
      //       userId === task.createdByUserId ||
      //       userRoles.some((role) => allowedRoles.includes(role)) ||
      //       isAssignedToTask
      //     );
      //   },
      //   async canEditOrDelete(taskId: string, userId: string) {
      //     const task = await client.task.getTaskById(taskId);
      //     const userRoles = await client.user.getUserRoleBasedOnProject(userId);

      //     const allowedRoles: UserRoleEnum[] = [
      //       UserRoleEnum.ADMINISTRATOR,
      //       UserRoleEnum.PROJECT_MANAGER,
      //     ];
      //     const isTaskAuthor = task.createdByUserId === userId;
      //     const isAssignedToTask = task.assignedUsers.some(
      //       (assignedUser) => assignedUser.user.userId === userId
      //     );
      //     const canPerformAction =
      //       userRoles.some((role) => allowedRoles.includes(role)) ||
      //       isTaskAuthor ||
      //       isAssignedToTask;
      //     return canPerformAction;
      //   },
      //   async getTaskById(taskId: string) {
      //     return client.task.findFirstOrThrow({
      //       where: { taskId, deletedAt: null },
      //       include: {
      //         assignedUsers: {
      //           where: { deletedAt: null },
      //           include: {
      //             user: true,
      //           },
      //         },
      //       },
      //     });
      //   },
      //   async calculateSubTask(startingTaskId: string) {
      //     let currentTaskId: string | null = startingTaskId;
      //     let count = 0;
      //     while (currentTaskId) {
      //       const currentTask = (await client.task.findFirst({
      //         where: { taskId: currentTaskId, deletedAt: null },
      //         select: { parentTaskId: true },
      //       })) as { taskId: string; parentTaskId: string | null };
      //       if (currentTask) {
      //         count += 1;
      //         currentTaskId = currentTask.parentTaskId;
      //       } else {
      //         break;
      //       }
      //     }
      //     return count;
      //   },
      //   calculateEndDate(startDate: Date, duration: number) {
      //     const startDateObj = new Date(startDate);
      //     const endDate = new Date(startDateObj);

      //     const integerPart = Math.floor(duration);
      //     endDate.setDate(startDateObj.getDate() + integerPart);

      //     const fractionalPartInHours = (duration % 1) * 24;
      //     endDate.setHours(startDateObj.getHours() + fractionalPartInHours);

      //     return endDate;
      //   },
      //   async taskWithAllDetails(taskId: string) {
      //     return client.task.findFirst({
      //       where: { taskId: taskId, deletedAt: null },
      //       include: {
      //         subtasks: {
      //           where: { deletedAt: null },
      //           include: {
      //             subtasks: {
      //               where: { deletedAt: null },
      //               include: {
      //                 subtasks: true,
      //               },
      //             },
      //           },
      //         },
      //         dependencies: true,
      //       },
      //     });
      //   },
      // },
      // comments: {
      //   async canEditOrDelete(commentId: string, userId: string) {
      //     const comment = await client.comments.findFirstOrThrow({
      //       where: { commentId, deletedAt: null },
      //       include: {
      //         commentByUser: true,
      //       },
      //     });
      //     const userRoles = await client.user.getUserRoleBasedOnProject(userId);

      //     const allowedRoles: UserRoleEnum[] = [
      //       UserRoleEnum.ADMINISTRATOR,
      //       UserRoleEnum.PROJECT_MANAGER,
      //     ];

      //     const isCommentAuthor = comment.commentByUser.userId === userId;
      //     const canPerformAction =
      //       userRoles.some((role) => allowedRoles.includes(role)) ||
      //       isCommentAuthor;

      //     return canPerformAction;
      //   },
      // },
      // taskAttachment: {
      //   async canDelete(attachmentId: string, userId: string) {
      //     const attachment = await client.taskAttachment.findFirstOrThrow({
      //       where: { attachmentId: attachmentId, deletedAt: null },
      //       include: {
      //         task: {
      //           include: {
      //             assignedUsers: {
      //               where: { deletedAt: null },
      //               include: {
      //                 user: true,
      //               },
      //             },
      //           },
      //         },
      //       },
      //     });

      //     const userRoles = await client.user.getUserRoleBasedOnProject(userId);
      //     const allowedRoles: UserRoleEnum[] = [
      //       UserRoleEnum.ADMINISTRATOR,
      //       UserRoleEnum.PROJECT_MANAGER,
      //     ];
      //     const isAttachmentAuthor = attachment.uploadedBy === userId;
      //     const canPerformAction =
      //       userRoles.some((role) => allowedRoles.includes(role)) ||
      //       isAttachmentAuthor;

      //     return canPerformAction;
      //   },
      // },
      // taskDependencies: {
      //   async canDelete(taskDependenciesId: string, userId: string) {
      //     const dependencies = await client.taskDependencies.findFirstOrThrow({
      //       where: {
      //         taskDependenciesId: taskDependenciesId,
      //         deletedAt: null,
      //       },
      //     });

      //     const userRoles = await client.user.getUserRoleBasedOnProject(userId);
      //     const allowedRoles: UserRoleEnum[] = [
      //       UserRoleEnum.ADMINISTRATOR,
      //       UserRoleEnum.PROJECT_MANAGER,
      //     ];
      //     const isDependenciesAuthor =
      //       dependencies.dependenciesAddedBy === userId;
      //     const canPerformAction =
      //       userRoles.some((role) => allowedRoles.includes(role)) ||
      //       isDependenciesAuthor;

      //     return canPerformAction;
      //   },
      // },
      // user: {
      //   async getUserRoles(userId: string) {
      //     const user = await client.user.findFirstOrThrow({
      //       include: {
      //         userOrganisation: {
      //           where: { deletedAt: null },
      //           select: {
      //             role: true,
      //           },
      //         },
      //       },
      //       where: {
      //         userId: userId,
      //         deletedAt: null,
      //       },
      //     });
      //     return user.userOrganisation.map((org) => org.role);
      //   },
      //   async getUserRoleBasedOnProject(userId: string) {
      //     const roles = await client.projectAssignUsers.findMany({
      //       where: {
      //         assginedToUserId: userId,
      //       },
      //     });
      //     return roles.map((role) => role.projectRole);
      //   },
      // },
    },
  });
  return client;
}

export async function getClientByTenantId(
  tenantId: string
): Promise<ReturnType<typeof generatePrismaClient>> {
  if (!tenantId) {
    return prismaClients.root;
  }
  const findTenant = await prismaClients.root?.tenant.findUnique({
    where: { tenantId: tenantId },
  });
  if (!findTenant) {
    return prismaClients.root;
  }
  prismaClients[tenantId] = generatePrismaClient(findTenant.connectionString!);
  return prismaClients[tenantId] as ReturnType<typeof generatePrismaClient>;
}
