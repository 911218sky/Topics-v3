// npm
import admin, { messaging } from "firebase-admin";
import { config } from "dotenv";

// components
import Prisma from "./Prisma";
config({ path: "../../.env" });

namespace SendMessage {
  admin.initializeApp({
    credential: admin.credential.cert(require("./../../system/firebase.json")),
  });
  export function send(message: messaging.Message) {
    return admin.messaging().send(message);
  }
  export function sendMulticast(multicastMessage: messaging.MulticastMessage) {
    return admin.messaging().sendEachForMulticast(multicastMessage);
  }
  export async function sendToUsers(
    message: messaging.Notification,
    usersId: string[] | number[]
  ) {
    return Prisma.user
      .findMany({
        where: {
          id: {
            in: usersId.map(Number),
          },
        },
        select: {
          firebaseCloudMessagingToken: true,
        },
      })
      .then((tokens) => {
        const newTokens = tokens
          .filter((token) => token.firebaseCloudMessagingToken !== null)
          .map((token) => token.firebaseCloudMessagingToken!);
        if (newTokens.length > 0) {
          SendMessage.sendMulticast({
            tokens: newTokens,
            notification: {
              ...message,
            },
          });
        }
      });
  }
}

export default SendMessage;

// const message: Message = {
//   notification: {
//     title: "Hello, World!",
//     body: "This is a sample FCM message from your Node.js server.",
//   },
//   token: "DEVICE_FCM_TOKEN",
// };
