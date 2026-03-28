const fs = require('fs');
const filePath = 'src/repositories/transaction.repository.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure updateTransactionStatusBySessionId exists if not already added
if (!content.includes('updateTransactionStatusBySessionId')) {
    // This part was already added successfully in a previous turn
}

// Add stripeSessionId to $or queries
const searchPattern = /\{ razorpayPaymentId: \{ \$regex: search, \$options: 'i' \} \}/g;
const replacement = `{ razorpayPaymentId: { $regex: search, $options: 'i' } },\n        { stripeSessionId: { $regex: search, $options: 'i' } }`;

// Check if already replaced
if (!content.includes('stripeSessionId: { $regex: search, $options: \'i\' }')) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated search queries in TransactionRepository.ts');
} else {
    console.log('Search queries already include stripeSessionId.');
}
