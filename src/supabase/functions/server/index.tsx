import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Ensure storage bucket exists
const ensureBucket = async () => {
  const bucketName = 'make-46fa08c1-images';
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
      });
      console.log(`✅ Storage bucket '${bucketName}' created`);
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error);
  }
};

// Call on startup
ensureBucket();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-46fa08c1/health", (c) => {
  return c.json({ status: "ok" });
});

// Practice tests endpoints
// Get all practice tests
app.get("/make-server-46fa08c1/practice-tests", async (c) => {
  try {
    const tests = await kv.getByPrefix("practice_test:");
    return c.json({ success: true, tests });
  } catch (error) {
    console.log("Error fetching practice tests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get practice test by ID
app.get("/make-server-46fa08c1/practice-tests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const test = await kv.get(`practice_test:${id}`);
    if (!test) {
      return c.json({ success: false, error: "Test not found" }, 404);
    }
    return c.json({ success: true, test });
  } catch (error) {
    console.log("Error fetching practice test:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get practice tests by category
app.get("/make-server-46fa08c1/practice-tests/category/:category", async (c) => {
  try {
    const category = c.req.param("category");
    const allTests = await kv.getByPrefix("practice_test:");
    const filteredTests = allTests.filter(test => test.category === category);
    return c.json({ success: true, tests: filteredTests });
  } catch (error) {
    console.log("Error fetching practice tests by category:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or update practice test (단일 또는 배열)
app.post("/make-server-46fa08c1/practice-tests", async (c) => {
  try {
    const body = await c.req.json();
    
    // 배열로 받은 경우 (전체 테스트 동기화)
    if (body.tests && Array.isArray(body.tests)) {
      console.log(`📦 ${body.tests.length}개의 테스트를 Supabase에 저장합니다...`);
      
      // 기존 데이터 모두 삭제
      const existingTests = await kv.getByPrefix("practice_test:");
      for (const test of existingTests) {
        if (test.id) {
          await kv.del(`practice_test:${test.id}`);
        }
      }
      
      // 새로운 데이터 저장
      for (const test of body.tests) {
        if (test.id) {
          await kv.set(`practice_test:${test.id}`, test);
        }
      }
      
      console.log(`✅ ${body.tests.length}개의 테스트가 Supabase에 저장되었습니다.`);
      return c.json({ success: true, message: `${body.tests.length} tests saved successfully` });
    }
    
    // 단일 테스트인 경우
    const { id, ...testData } = body;
    
    if (!id) {
      return c.json({ success: false, error: "Test ID is required" }, 400);
    }
    
    await kv.set(`practice_test:${id}`, testData);
    console.log(`✅ 테스트 ID ${id}가 Supabase에 저장되었습니다.`);
    return c.json({ success: true, message: "Test saved successfully" });
  } catch (error) {
    console.log("Error saving practice test:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete practice test
app.delete("/make-server-46fa08c1/practice-tests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`practice_test:${id}`);
    return c.json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    console.log("Error deleting practice test:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Initialize practice tests with default data
app.post("/make-server-46fa08c1/practice-tests/init", async (c) => {
  try {
    const body = await c.req.json();
    const { tests } = body;
    
    if (!Array.isArray(tests)) {
      return c.json({ success: false, error: "Tests must be an array" }, 400);
    }
    
    // Save all tests
    for (const test of tests) {
      if (test.id) {
        await kv.set(`practice_test:${test.id}`, test);
      }
    }
    
    return c.json({ success: true, message: `${tests.length} tests initialized` });
  } catch (error) {
    console.log("Error initializing practice tests:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Uploaded files endpoints
// Get all uploaded files
app.get("/make-server-46fa08c1/uploaded-files", async (c) => {
  try {
    const files = await kv.get("uploaded_files");
    return c.json({ success: true, files: files || [] });
  } catch (error) {
    console.log("Error fetching uploaded files:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Save uploaded files (replaces all)
app.post("/make-server-46fa08c1/uploaded-files", async (c) => {
  try {
    const body = await c.req.json();
    const { files } = body;
    
    if (!Array.isArray(files)) {
      return c.json({ success: false, error: "Files must be an array" }, 400);
    }
    
    await kv.set("uploaded_files", files);
    console.log(`✅ ${files.length}개의 파일이 Supabase에 저장되었습니다.`);
    return c.json({ success: true, message: `${files.length} files saved successfully` });
  } catch (error) {
    console.log("Error saving uploaded files:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==============================================
// Advertisement Management Routes
// ==============================================

// Get all advertisements
app.get('/make-server-46fa08c1/advertisements', async (c) => {
  try {
    const ads = await kv.getByPrefix('advertisement:');
    const sortedAds = ads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json(sortedAds);
  } catch (error) {
    console.error('Error loading advertisements:', error);
    return c.json({ error: 'Failed to load advertisements', details: String(error) }, 500);
  }
});

// Create or update advertisement
app.post('/make-server-46fa08c1/advertisements', async (c) => {
  try {
    const ad = await c.req.json();
    await kv.set(`advertisement:${ad.id}`, ad);
    console.log('✅ Advertisement saved:', ad.id);
    return c.json({ success: true, ad });
  } catch (error) {
    console.error('Error saving advertisement:', error);
    return c.json({ success: false, error: 'Failed to save advertisement', details: String(error) }, 500);
  }
});

// Update advertisement
app.put('/make-server-46fa08c1/advertisements', async (c) => {
  try {
    const ad = await c.req.json();
    await kv.set(`advertisement:${ad.id}`, ad);
    console.log('✅ Advertisement updated:', ad.id);
    return c.json({ success: true, ad });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return c.json({ success: false, error: 'Failed to update advertisement', details: String(error) }, 500);
  }
});

// Delete advertisement
app.delete('/make-server-46fa08c1/advertisements/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`advertisement:${id}`);
    console.log('✅ Advertisement deleted:', id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return c.json({ success: false, error: 'Failed to delete advertisement', details: String(error) }, 500);
  }
});

// Get active advertisements (for display)
app.get('/make-server-46fa08c1/advertisements/active', async (c) => {
  try {
    const ads = await kv.getByPrefix('advertisement:');
    const activeAds = ads
      .filter(ad => ad.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json(activeAds);
  } catch (error) {
    console.error('Error loading active advertisements:', error);
    return c.json({ error: 'Failed to load active advertisements', details: String(error) }, 500);
  }
});

// ==============================================
// Image Upload Routes
// ==============================================

// Upload image to Supabase Storage
app.post('/make-server-46fa08c1/upload-image', async (c) => {
  try {
    const body = await c.req.json();
    const { fileData, fileName, contentType } = body;
    
    if (!fileData || !fileName) {
      return c.json({ success: false, error: 'File data and name are required' }, 400);
    }

    // Decode base64 file data
    const base64Data = fileData.split(',')[1] || fileData;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const bucketName = 'make-46fa08c1-images';
    const filePath = `${Date.now()}-${fileName}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, binaryData, {
        contentType: contentType || 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ success: false, error: 'Failed to upload image', details: String(uploadError) }, 500);
    }

    // Generate signed URL (valid for 10 years)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds

    if (urlError) {
      console.error('URL generation error:', urlError);
      return c.json({ success: false, error: 'Failed to generate URL', details: String(urlError) }, 500);
    }

    console.log('✅ Image uploaded:', filePath);
    return c.json({ 
      success: true, 
      imageUrl: urlData.signedUrl,
      filePath 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ success: false, error: 'Failed to upload image', details: String(error) }, 500);
  }
});

// Delete image from Supabase Storage
app.delete('/make-server-46fa08c1/delete-image/:filePath', async (c) => {
  try {
    const filePath = c.req.param('filePath');
    const bucketName = 'make-46fa08c1-images';
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return c.json({ success: false, error: 'Failed to delete image', details: String(error) }, 500);
    }

    console.log('✅ Image deleted:', filePath);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return c.json({ success: false, error: 'Failed to delete image', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);