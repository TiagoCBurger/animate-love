/**
 * Test script for Kling 2.5 API
 *
 * Usage:
 *   npx tsx scripts/test-kling.ts
 */

import { startKlingMultishotGeneration, getTaskStatus } from "../lib/kie";

async function testKling() {
  console.log("🧪 Testing Kling 2.5 API...\n");

  // Check if API key is configured
  if (!process.env.KIE_API_KEY) {
    console.error("❌ KIE_API_KEY not found in environment variables");
    console.log("Please add KIE_API_KEY to your .env.local file");
    process.exit(1);
  }

  console.log("✅ KIE_API_KEY found");

  // Test with a sample image (using a public test image)
  const testImageUrl = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800";
  const testPrompt = "Romantic couple portrait, tender loving moment";

  try {
    console.log("\n📤 Starting video generation...");
    console.log("Image URL:", testImageUrl);
    console.log("Prompt:", testPrompt);

    const taskId = await startKlingMultishotGeneration({
      imageUrl: testImageUrl,
      prompt: testPrompt,
      promptType: "romantic_generic",
      duration: "5",
      model: "v2.5-turbo-pro",
    });

    console.log("\n✅ Task created successfully!");
    console.log("Task ID:", taskId);

    // Check status once
    console.log("\n📊 Checking task status...");
    const status = await getTaskStatus(taskId);
    console.log("Status:", JSON.stringify(status, null, 2));

    console.log("\n✅ Test completed successfully!");
    console.log("\nNote: Video generation takes 3-5 minutes.");
    console.log("You can check the status in your application using this taskId:", taskId);

  } catch (error) {
    console.error("\n❌ Error during test:");
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testKling();
