const jwtService = require("./../../src/services/jwt.service");

describe("jwtService.token():", () => {
    it("Get successful", async () => {
        const payload = {
            id: "234",
            email: "shihab4t@gmail.com",
            role: "admin"
        };
        const token = await jwtService.token(payload);
        expect(token).not.toBeFalsy();
    });
});

describe("jwtService.compare():", () => {
    it("Get successful", async () => {
        const payload = {
            id: 234,
            email: "shihab4t@gmail.com",
            role: "admin"
        };
        const token = await jwtService.token(payload);
        const decoded = await jwtService.compare(token);
        expect(decoded.id).toBe(payload.id);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.role).toBe(payload.role);
    });
});
