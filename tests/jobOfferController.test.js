import sinon from "sinon.js";

describe("JobOfferController", () => {
	let jobOfferStub, historyStub;

	beforeEach(() => {
		jobOfferStub = sinon.stub(JobOffer, "createJobOffer");
		historyStub = sinon.stub(History, "logAction");
	});

	afterEach(() => {
		jobOfferStub.restore();
		historyStub.restore();
	});

	it("should create a job offer successfully", async () => {
		const jobOfferData = {
			recruiterId: "123",
			title: "Software Engineer",
			description: "Job description",
			requirements: "Job requirements",
			salaryRange: "50k-70k",
			employmentType: "Full-time",
			location: "Remote",
			remote: true,
			expirationDate: "2023-12-31",
			status: "open"
		};

		jobOfferStub.resolves("jobOfferId");
		historyStub.resolves();

		const res = await chai.request(server).post("/job-offers").send(jobOfferData);

		expect(res).to.have.status(201);
		expect(res.body).to.have.property("message", "Job offer created successfully");
		expect(res.body).to.have.property("jobOfferId", "jobOfferId");
	});

	it("should return 400 if required fields are missing", async () => {
		const res = await chai.request(server).post("/job-offers").send({});

		expect(res).to.have.status(400);
		expect(res.body).to.have.property("message", "Required fields are missing");
	});

	it("should return 500 on internal server error", async () => {
		jobOfferStub.rejects(new Error("Internal server error"));

		const res = await chai.request(server).post("/job-offers").send({
			recruiterId: "123",
			title: "Software Engineer",
			employmentType: "Full-time"
		});

		expect(res).to.have.status(500);
		expect(res.body).to.have.property("message", "Internal server error");
	});
});
