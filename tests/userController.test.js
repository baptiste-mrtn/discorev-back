import request from "supertest";
import app from "../src/server.js";

describe("AuthController Tests", () => {

	const fakeUser = {
		firstName: "Mock",
		lastName: "User",
		email: "test@test.com",
		password: "password",
		phoneNumber: "12345678",
		profilePicture: "profile.png",
		accountType: "recruiter"
	};

	let token = "";
	let userId = "";
	
	it("should register a user", async () => {
		const registerRes = await request(app).post("/auth/register").send(fakeUser);

		if (registerRes.status === 409) {
			console.log("User already exists, continuing with login...");
			userId = registerRes.body.userId;
		} else {
			expect(registerRes.status).toBe(201);
			expect(registerRes.body).toHaveProperty("userId");
			userId = registerRes.body.userId;
		}
	});

	it("should login a user", async () => {
		const loginRes = await request(app)
			.post("/auth/login")
			.send({ email: fakeUser.email, password: fakeUser.password });

		expect(loginRes.status).toBe(200);
		expect(loginRes.body).toHaveProperty("token");
		token = loginRes.body.token;
	});

	it("should get current user info", async () => {
		const getUserRes = await request(app)
			.get("/auth/me")
			.set("Authorization", `Bearer ${token}`);

		expect(getUserRes.status).toBe(200);
		expect(getUserRes.body).toMatchObject({
			firstName: fakeUser.firstName,
			lastName: fakeUser.lastName,
			email: fakeUser.email
		});
	});

	it("should update the user profile", async () => {
		const updates = { firstName: "UpdatedMock" };
		const updateRes = await request(app)
			.put(`/users/${userId}`)
			.set("Authorization", `Bearer ${token}`)
			.send(updates);

		expect(updateRes.status).toBe(200);
		expect(updateRes.body).toHaveProperty("message", "User updated successfully");
	});
});
