import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:u0mveDWql9gx@ep-proud-glitter-a5blpm24-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

const posts = await sql`
    SELECT metadata -> 'writes' as query 
    FROM checkpoints 
    ORDER BY ctid DESC 
    LIMIT 1
`;

if (posts[0]['query'] && posts[0]['query'].model && Array.isArray(posts[0]['query'].model.messages)) {
    console.log('Model messages:');
    posts[0]['query'].model.messages.forEach((message, index) => {
        // Fixed if statement syntax
        if (message['kwargs']['type'] === 'human') {  // Added parentheses and curly braces
            console.log(`Human Message ${index + 1}:`, message['kwargs']['content']);
        }
        if (message['kwargs']['type'] === 'ai') {     // Added parentheses and curly braces
            console.log(`AI Message ${index + 1}:`,    // Changed "Human" to "AI" in the label
                message['kwargs']['content']);
        }
    });
}

console.log(posts.length);