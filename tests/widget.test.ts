import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.tidio.com/panel/register");
});

export const getNewEmail = (): string =>
  `testing+${new Date().getTime()}@tidio.net`;

let password = (Math.random() + 1).toString(36).substring(2);

test.describe("Widget tests", () => {
  test("Send message from widget to panel and from panel to widget", async ({
    page,
  }) => {
    await test.step("Register new account", async () => {
      await page.locator('[placeholder="Email"]').fill(getNewEmail());
      await page.locator('[placeholder="Password"]').fill(password);
      await page.locator('[placeholder="Website"]').fill("example.com");
      await page.locator('[type="checkbox"]').click();
      await page.locator("button", { hasText: "Get started" }).click();
      await expect(
        page.locator("h3", { hasText: "Configure your live chat" })
      ).toBeVisible();
    });
    await test.step("Complete tour", async () => {
      const continueButton = page.locator("css=button >> text=Continue");
      await page.locator("//*[text()='Your name']/..//input").fill("user");
      await continueButton.click();
      await page
        .locator("//*[text()='Number of support agents']/..//input")
        .fill("5");
      await page.locator('//label[text()="What\'s your industry?"]/..').click();
      await page.locator('text="Online Store"').click();
      await page.locator('//label[text()="Number of customers"]/..').click();
      await page.locator('text="6-25"').click();
      await page
        .locator(
          "//*[contains(text(),'I want to have a customer service tool')]"
        )
        .click();
      await continueButton.click();
      await continueButton.click();
      await continueButton.click();
      await page.locator('text="Skip now & go to main dashboard"').click();
      await expect(page.locator("h2", { hasText: "News Feed" })).toBeVisible();
    });
    await test.step(
      "Simulate visitor and send message from widget to panel",
      async () => {
        const visitorMessage = "Hello!";
        await page.locator("[href='/panel/conversations']").click();
        const [popup] = await Promise.all([
          page.waitForEvent('popup'),
          await page.locator('text="Simulate a conversation"').click()
        ]);
        await popup.waitForLoadState();
        const iframe = popup.frameLocator('id=tidio-chat-iframe');
        await iframe.locator('.message-container').hover();
        await iframe.locator('id=ic_close').click();
        await iframe.locator('text="Chat with us"').click();
        await iframe.locator('[placeholder="Hit the buttons to respond"]').fill(visitorMessage);
        await popup.keyboard.press('Enter');
        await iframe.locator('[placeholder="Enter your email..."]').fill(getNewEmail());
        await iframe.locator('text="Send"').click();
        await expect(page.locator("//*[text()='Unassigned']/..//p", { hasText: visitorMessage })).toBeVisible();
      }
    );
    await test.step("Send a reply message from the panel", async () => {
      const operatorReplyMessage = "Hello, how can I help you?";
      await page.locator('text="Hello!"').click();
      await page.keyboard.press('Enter');
      await page.locator('text="Got it!"').click();
      await page.locator('[placeholder="Write your message or type / to pick a Quick Response"]').fill(operatorReplyMessage);
      await page.locator('text="Reply"').click();
      await expect(page.locator("//*[text()='You']/../../..//span", { hasText: operatorReplyMessage })).toBeVisible();
    });
  });
});
