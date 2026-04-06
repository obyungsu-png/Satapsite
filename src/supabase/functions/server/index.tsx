import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

let supabase: ReturnType<typeof createClient> | null = null;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.log('Supabase client creation failed:', e);
}

// Ensure storage bucket exists
const ensureBucket = async () => {
  if (!supabase) return;
  const bucketName = 'make-46fa08c1-images';
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
      });
      console.log(`Storage bucket '${bucketName}' created`);
    }
  } catch (error) {
    console.log('Error ensuring bucket:', error);
  }
};

// Call on startup (non-blocking)
ensureBucket();

// Enable logger
app.use('*', logger());

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
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
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

// ==============================================
// Student Management Routes
// ==============================================

// Get all students
app.get('/make-server-46fa08c1/students', async (c) => {
  try {
    const students = await kv.getByPrefix('student:');
    
    // Get practice record count for each student
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        try {
          const records = await kv.getByPrefix(`practice_record:${student.id}:`);
          return {
            ...student,
            testCount: records.length || 0
          };
        } catch {
          return {
            ...student,
            testCount: 0
          };
        }
      })
    );
    
    const sortedStudents = studentsWithCounts.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return c.json({ success: true, students: sortedStudents });
  } catch (error) {
    console.error('Error loading students:', error);
    return c.json({ success: false, error: 'Failed to load students', details: String(error) }, 500);
  }
});

// Get student by ID
app.get('/make-server-46fa08c1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const student = await kv.get(`student:${id}`);
    if (!student) {
      return c.json({ success: false, error: 'Student not found' }, 404);
    }
    return c.json({ success: true, student });
  } catch (error) {
    console.error('Error loading student:', error);
    return c.json({ success: false, error: 'Failed to load student', details: String(error) }, 500);
  }
});

// Create or update student
app.post('/make-server-46fa08c1/students', async (c) => {
  try {
    const student = await c.req.json();
    
    // Generate ID if not provided
    if (!student.id) {
      student.id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add timestamp if not provided
    if (!student.createdAt) {
      student.createdAt = new Date().toISOString();
    }
    
    await kv.set(`student:${student.id}`, student);
    console.log('✅ Student saved:', student.id);
    return c.json({ success: true, student });
  } catch (error) {
    console.error('Error saving student:', error);
    return c.json({ success: false, error: 'Failed to save student', details: String(error) }, 500);
  }
});

// Update student
app.put('/make-server-46fa08c1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`student:${id}`);
    if (!existing) {
      return c.json({ success: false, error: 'Student not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, id };
    await kv.set(`student:${id}`, updated);
    console.log('✅ Student updated:', id);
    return c.json({ success: true, student: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    return c.json({ success: false, error: 'Failed to update student', details: String(error) }, 500);
  }
});

// Delete student
app.delete('/make-server-46fa08c1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`student:${id}`);
    console.log('✅ Student deleted:', id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return c.json({ success: false, error: 'Failed to delete student', details: String(error) }, 500);
  }
});

// ==============================================
// Practice Record Routes
// ==============================================

// Get all practice records for a student
app.get('/make-server-46fa08c1/practice-records/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const records = await kv.getByPrefix(`practice_record:${studentId}:`);
    const sortedRecords = records.sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    return c.json({ success: true, records: sortedRecords });
  } catch (error) {
    console.error('Error loading practice records:', error);
    return c.json({ success: false, error: 'Failed to load practice records', details: String(error) }, 500);
  }
});

// Save practice record
app.post('/make-server-46fa08c1/practice-records', async (c) => {
  try {
    const record = await c.req.json();
    
    if (!record.studentId) {
      return c.json({ success: false, error: 'Student ID is required' }, 400);
    }
    
    // Generate ID if not provided
    if (!record.id) {
      record.id = Date.now();
    }
    
    // Add timestamp if not provided
    if (!record.timestamp) {
      record.timestamp = new Date().toISOString();
    }
    
    const key = `practice_record:${record.studentId}:${record.id}`;
    await kv.set(key, record);
    console.log('✅ Practice record saved:', key);
    return c.json({ success: true, record });
  } catch (error) {
    console.error('Error saving practice record:', error);
    return c.json({ success: false, error: 'Failed to save practice record', details: String(error) }, 500);
  }
});

// Delete practice record
app.delete('/make-server-46fa08c1/practice-records/:studentId/:recordId', async (c) => {
  try {
    const studentId = c.req.param('studentId');
    const recordId = c.req.param('recordId');
    const key = `practice_record:${studentId}:${recordId}`;
    await kv.del(key);
    console.log('✅ Practice record deleted:', key);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting practice record:', error);
    return c.json({ success: false, error: 'Failed to delete practice record', details: String(error) }, 500);
  }
});

// ==============================================
// Image Upload Routes
// ==============================================

// Upload image to Supabase Storage
app.post('/make-server-46fa08c1/upload-image', async (c) => {
  try {
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase client not initialized' }, 500);
    }
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
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase client not initialized' }, 500);
    }
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

// ==============================================
// AI Analysis Routes (DeepSeek API)
// ==============================================

// AI Analysis endpoint
app.post('/make-server-46fa08c1/ai-analysis', async (c) => {
  try {
    const { type, question, passage, choices } = await c.req.json();
    
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      return c.json({ 
        success: false, 
        error: 'DEEPSEEK_API_KEY not configured',
        message: 'AI 기능을 사용하려면 DeepSeek API 키가 필요합니다.' 
      }, 500);
    }

    // Build prompt based on analysis type
    let prompt = '';
    switch (type) {
      case '해석':
        prompt = `다음 SAT 지문을 한국어로 정확하게 해석해주세요. 문단별로 구분하여 설명해주세요:\n\n${passage}`;
        break;
      case '분석':
        prompt = `다음 SAT 문제를 분석해주세요:\n\n지문: ${passage}\n\n질문: ${question}\n\n선택지:\n${choices.map((c: any, i: number) => `${String.fromCharCode(65 + i)}. ${c.text}`).join('\n')}\n\n출제 의도, 해결 전략, 주의사항을 포함하여 분석해주세요.`;
        break;
      case '단어':
        prompt = `다음 SAT 지문에서 중요한 어휘를 추출하고 설명해주세요:\n\n${passage}\n\n각 단어의 뜻, 예문, 중요도를 포함해주세요.`;
        break;
      case '정답':
        prompt = `다음 SAT 문제의 정답을 찾고, 각 선택지가 왜 정답이거나 오답인지 설명해주세요:\n\n지문: ${passage}\n\n질문: ${question}\n\n선택지:\n${choices.map((c: any, i: number) => `${String.fromCharCode(65 + i)}. ${c.text}`).join('\n')}`;
        break;
      default:
        return c.json({ success: false, error: 'Invalid analysis type' }, 400);
    }

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '당신은 SAT 시험 전문가입니다. 학생들이 문제를 이해하고 해결할 수 있도록 명확하고 체계적으로 설명해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return c.json({ 
        success: false, 
        error: 'DeepSeek API request failed',
        details: errorText 
      }, response.status);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return c.json({ 
      success: true, 
      response: aiResponse,
      type 
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return c.json({ 
      success: false, 
      error: 'AI analysis failed', 
      details: String(error) 
    }, 500);
  }
});

Deno.serve(app.fetch);