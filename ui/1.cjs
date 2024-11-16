// db.js
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

function convertDBMessagesToChat(dbMessages, index) {
    return {
        id: index,
        messages: dbMessages.map(msg => ({
            content: msg.kwargs.content,
            type: msg.kwargs.type
        }))
    };
}

async function fetchMessagesFromDB() {
    try {
        
        const sql = neon("postgresql://neondb_owner:u0mveDWql9gx@ep-proud-glitter-a5blpm24-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require");
        const posts = await sql`
            SELECT DISTINCT ON (metadata->'writes'->'model'->'messages') metadata -> 'writes' as query
            FROM checkpoints
            ORDER BY metadata->'writes'->'model'->'messages', ctid DESC
            LIMIT 30
        `;

        const seenMessages = new Set();
        const uniqueChats = [];

        posts.forEach((post, index) => {
            if (post?.query?.model?.messages) {
                const dbMessages = post.query.model.messages;
                
                // Log the raw messages from database
                console.log('\n--- Raw Database Messages for Post', index, '---');
                console.log(JSON.stringify(dbMessages, null, 2));

                const chatHash = JSON.stringify(dbMessages.map(msg => ({
                    content: msg.kwargs.content.trim(),
                    type: msg.kwargs.type
                })));

                if (!seenMessages.has(chatHash)) {
                    seenMessages.add(chatHash);
                    const newChat = convertDBMessagesToChat(dbMessages, index);
                    uniqueChats.push(newChat);
                    
                    // Log each unique chat's messages
                    console.log('\n=== Unique Chat', index, '===');
                    newChat.messages.forEach((msg, msgIndex) => {
                        console.log(`\nMessage ${msgIndex + 1}:`);
                        console.log('Type:', msg.type);
                        console.log('Content:', msg.content);
                        console.log('-'.repeat(50));
                    });
                }
            }
        });

        // Log summary
        console.log('\n=== Summary ===');
        console.log(`Total unique chats found: ${uniqueChats.length}`);
        console.log(`Total messages processed: ${posts.length}`);

        return uniqueChats;

    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

// Run the function
fetchMessagesFromDB()
    .then(chats => {
        console.log('\nScript completed successfully');
    })
    .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });