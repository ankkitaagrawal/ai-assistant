import { userSchema } from "./user";
import { z } from "zod";

describe("userSchema", () => {
    it("should validate a valid user object", () => {
        const validUser = {
            email: "test@example.com",
            phone: "1234567890",
            gender: "male",
            name: "John Doe",
        };

        expect(() => {
            userSchema.parse(validUser);
        }).not.toThrow();
    });

    it("should throw an error for an invalid email", () => {
        const invalidUser = {
            email: "invalidemail",
            phone: "1234567890",
            gender: "male",
            name: "John Doe",
        };

        expect(() => {
            userSchema.parse(invalidUser);
        }).toThrow(z.ZodError);
    });

    it("should throw an error for an invalid phone number", () => {
        const invalidUser = {
            email: "test@example.com",
            phone: "123",
            gender: "male",
            name: "John Doe",
        };

        expect(() => {
            userSchema.parse(invalidUser);
        }).toThrow(z.ZodError);
    });

    it("should throw an error for an invalid gender", () => {
        const invalidUser = {
            email: "test@example.com",
            phone: "1234567890",
            gender: "invalid",
            name: "John Doe",
        };

        expect(() => {
            userSchema.parse(invalidUser);
        }).toThrow(z.ZodError);
    });

    it("should throw an error for an invalid name", () => {
        const invalidUser = {
            email: "test@example.com",
            phone: "1234567890",
            gender: "male",
            name: 123,
        };

        expect(() => {
            userSchema.parse(invalidUser);
        }).toThrow(z.ZodError);
    });
});
