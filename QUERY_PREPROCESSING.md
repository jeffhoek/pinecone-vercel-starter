# Query Preprocessing for Improved RAG Performance

This document explains the query preprocessing feature that improves retrieval accuracy in the RAG system.

## The Problem

When users ask questions like "Does Jaco have any health concerns?", the RAG system performs worse than when they use simpler queries like "health concerns?". This happens because:

1. **Documents contain declarative statements** (e.g., "Jaco has no health concerns")
2. **Questions have extra words** that create noise in the embedding
3. **Vector similarity** is reduced by interrogative words like "does", "have", "any"

## The Solution

Query preprocessing removes common question words and normalizes the text before embedding, making user queries more similar to how information appears in documents.

## How It Works

### Preprocessing Steps

1. **Convert to lowercase** - Normalize casing
2. **Remove question words** - Strip interrogative and auxiliary words that don't carry core meaning
3. **Remove punctuation** - Clean up question marks, commas, etc.
4. **Normalize whitespace** - Collapse multiple spaces

### Example Transformations

```typescript
"Does Jaco have any health concerns?"  → "jaco health concerns"
"What are Jaco's favorite activities?" → "jaco's favorite activities"
"How does Jaco behave around other dogs?" → "jaco behave around other dogs"
"health concerns?" → "health concerns"
```

### Words Removed

The preprocessing removes these common question/auxiliary words:
- **Interrogatives**: what, when, where, who, why, how, which
- **Auxiliaries**: does, do, did, is, are, was, were, has, have, had
- **Modals**: can, could, would, should, will, shall, may, might, must
- **Articles**: a, an, the
- **Quantifiers**: any, some

## Implementation

### Files Added

**`src/app/utils/queryPreprocessing.ts`**
- Contains the `preprocessQuery()` function
- Handles all text normalization logic
- Includes logging to show transformations

### Files Modified

**`src/app/utils/context.ts`**
- Added preprocessing before embedding
- Preprocessed query is used for Pinecone search
- Original query is still passed to the LLM for context

## Usage

The preprocessing happens automatically for all queries. No configuration needed.

### In Code

```typescript
import { preprocessQuery } from './queryPreprocessing';

// Before
const embedding = await getEmbeddings(message);

// After
const preprocessedMessage = preprocessQuery(message);
const embedding = await getEmbeddings(preprocessedMessage);
```

### Monitoring

Check your server logs to see the preprocessing in action:

```
Query preprocessing: "Does Jaco have any health concerns?" -> "jaco health concerns"
```

## Expected Improvements

### Better Retrieval
- Queries match documents more closely
- Higher similarity scores in vector search
- More relevant chunks returned

### Better Answers
- LLM receives more relevant context
- Fewer hallucinations
- More accurate responses

## When It Helps Most

Preprocessing is especially beneficial for:

✅ **Natural questions** - "What does Jaco like to eat?"
✅ **Yes/no questions** - "Does Jaco have any allergies?"
✅ **Interrogative phrases** - "Can you tell me about..."

It has minimal impact on:

⚪ **Keyword queries** - "Jaco diet" (already optimized)
⚪ **Short phrases** - "walking schedule" (few words to remove)

## Trade-offs

### Advantages
- ✅ Significantly improves retrieval for natural language questions
- ✅ Zero latency overhead (preprocessing is instant)
- ✅ No additional API costs
- ✅ Works transparently for all queries

### Limitations
- ⚠️ Might lose nuance in very specific questions
- ⚠️ May remove contextually important words in edge cases
- ⚠️ Doesn't solve all RAG retrieval challenges

## Fallback Behavior

If preprocessing results in an empty string (all words removed), the system automatically falls back to using the original query.

## Testing

### Manual Testing

1. Try full questions: "Does Jaco have any health concerns?"
2. Compare with keyword queries: "health concerns"
3. Check server logs to see transformations
4. Verify answer quality improves

### Expected Behavior

Before preprocessing:
- Full question might retrieve less relevant chunks
- Answers might be generic or miss key details

After preprocessing:
- Preprocessed query retrieves more relevant chunks
- Answers are more specific and accurate

## Future Enhancements

If simple preprocessing isn't sufficient, consider:

1. **LLM-based keyword extraction** - Use GPT to extract key concepts
2. **Hypothetical Document Embeddings (HyDE)** - Generate hypothetical answers, search for those
3. **Query expansion** - Generate multiple query variations
4. **Hybrid search** - Combine semantic and keyword search

## Configuration

No configuration is currently needed. All queries are automatically preprocessed.

To disable preprocessing temporarily (for debugging):

```typescript
// In src/app/utils/context.ts
// Comment out this line:
// const preprocessedMessage = preprocessQuery(message);

// Use original message:
const embedding = await getEmbeddings(message);
```

## Performance Impact

- **Preprocessing time**: < 1ms (regex operations)
- **API calls**: None (no additional calls)
- **Latency**: Negligible
- **Cost**: $0

## Monitoring and Debugging

### Enable Detailed Logging

The `preprocessQuery()` function includes console logging:

```typescript
console.log(`Query preprocessing: "${query}" -> "${processed}"`);
```

View these logs in:
- **Local dev**: Terminal running `npm run dev`
- **Vercel**: Functions logs in deployment dashboard

### Metrics to Track

1. **User satisfaction** - Are answers better?
2. **Retrieval scores** - Check Pinecone similarity scores
3. **Context relevance** - Is retrieved context more relevant?

## Troubleshooting

### Issue: Answers Got Worse

**Possible causes:**
- Preprocessing removed important context words
- Documents use question-like phrasing

**Solutions:**
1. Review preprocessing logs to see transformations
2. Adjust the `questionWords` array to keep important words
3. Consider disabling for specific query patterns

### Issue: No Improvement

**Possible causes:**
- Queries were already short/optimized
- Documents don't match query style regardless
- Other retrieval issues (chunking, embedding model)

**Solutions:**
1. Verify preprocessing is actually changing queries (check logs)
2. Consider Phase 2 solutions (LLM extraction, HyDE)
3. Review document chunking strategy

## Examples

### Before and After Comparison

| Original Query | Preprocessed Query | Expected Improvement |
|----------------|-------------------|---------------------|
| "Does Jaco have any health concerns?" | "jaco health concerns" | High - removes 5 noise words |
| "What is Jaco's walking schedule?" | "jaco's walking schedule" | Medium - removes 2 words |
| "health concerns?" | "health concerns" | Low - minimal change |
| "Jaco diet" | "jaco diet" | None - already optimal |

## Related Files

- `src/app/utils/queryPreprocessing.ts` - Preprocessing logic
- `src/app/utils/context.ts` - Applied during context retrieval
- `src/app/api/chat/route.ts` - Chat endpoint (uses context)
- `src/app/api/context/route.ts` - Context endpoint (uses context)

## References

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Pinecone Query Best Practices](https://docs.pinecone.io/docs/query-data)
- [RAG Optimization Techniques](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**Summary**: Simple query preprocessing removes question words before embedding, improving semantic similarity with documents and resulting in better retrieval and more accurate answers.
