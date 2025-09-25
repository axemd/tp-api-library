import * as express from "express";
import * as jwt from "jsonwebtoken";
import {CustomError} from "./errorHandler";

// Plus maintenable qu'une liste par utilisateur
const RIGHTS_BY_USER: Record<string, string[] | "*"> = {
    admin: "*", // tous les droits
    gerant: [
        "read",
        "create:author", "update:author",
        "create:book", "update:book",
        "create:bookCopy", "update:bookCopy",
        "delete:bookCopy"
    ],
    utilisateur: [
        "read",
        "create:book"
    ],
};

export function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === "jwt") {
        const token = request.headers["authorization"];

        return new Promise((resolve, reject) => {
            if (!token) {
                return reject(new Error("No token provided"));
            }

            jwt.verify(token, "your_secret_key", function (erreur: any, decoded: any) {
                if (erreur || !decoded) {
                    const error: CustomError = new Error("Invalid token")
                    error.status = 401;
                    return reject(error);
                }

                const username = (decoded as any)?.username;
                const rights = (username && RIGHTS_BY_USER[username]) ?? [];

                if (scopes && scopes.length > 0) {
                    if (rights !== "*") {
                        const set = new Set(rights as string[]);
                        const hasAll = scopes.every((s) => set.has(s));
                        if (!hasAll) {
                            const error: CustomError = new Error("Insufficient scope");
                            error.status = 403;
                            return reject(error);
                        }
                    }
                }

                return resolve(decoded);
            });
        });
    } else {
        throw new Error("Only support JWT authentication");
    }
}
