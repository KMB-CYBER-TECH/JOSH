// Paystack Payment Integration - Naira Pricing
// Replace with your actual Paystack public key from https://dashboard.paystack.com
const PAYSTACK_PUBLIC_KEY = 'pk_test_your_public_key_here';

document.addEventListener('DOMContentLoaded', function() {
    const paystackButton = document.getElementById('payWithPaystack');

    if (paystackButton) {
        paystackButton.addEventListener('click', processPaystackPayment);
    }

    // Initialize Paystack
    if (typeof PaystackPop === 'undefined') {
        console.error('Paystack library not loaded');
        return;
    }
});

function processPaystackPayment() {
    const form = document.getElementById('enrollForm');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    // Validate required fields
    if (!name || !email || !phone) {
        alert('Please fill in all required fields (Name, Email, and Phone) before proceeding with payment.');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Calculate total amount in kobo (1 Naira = 100 kobo)
    const baseAmount = 30000 * 100; // ₦30,000 in kobo
    let personalizedAmount = 0;
    let personalizedMonths = 0;

    if (document.getElementById('personalizedPlan').checked) {
        personalizedMonths = parseInt(document.getElementById('personalizedMonths').value);
        personalizedAmount = personalizedMonths * 10000 * 100; // ₦10,000 per month in kobo
    }

    const totalAmount = baseAmount + personalizedAmount;

    // Validate Paystack key
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'pk_test_your_public_key_here') {
        alert('Payment system is not properly configured. Please contact support.');
        console.error('Paystack public key not configured');
        return;
    }

    console.log('Initiating Paystack payment for:', email, 'Amount:', totalAmount);

    // Create payment handler
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: totalAmount,
        currency: 'NGN',
        ref: 'LOSEIT_' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Full Name",
                    variable_name: "full_name",
                    value: name
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone_number",
                    value: phone
                },
                {
                    display_name: "Program",
                    variable_name: "program",
                    value: "LOSE IT Weight Loss"
                },
                {
                    display_name: "Personalized Plan",
                    variable_name: "personalized_plan",
                    value: personalizedMonths > 0 ? `Yes (${personalizedMonths} months)` : "No"
                }
            ]
        },
        callback: function(response) {
            // Payment successful
            console.log('Paystack callback received:', response);
            handlePaymentSuccess(response, {
                name: name,
                email: email,
                phone: phone,
                weight: form.weight.value,
                goal: form.goal.value,
                plan: form.plan.value,
                personalized_plan: personalizedMonths > 0 ? "yes" : "no",
                personalized_months: personalizedMonths.toString(),
                total_amount: totalAmount
            });
        },
        onClose: function() {
            // Payment modal closed
            console.log('Payment window closed.');
            alert('Payment was not completed. You can try again anytime.');
        }
    });

    handler.openIframe();
}

function handlePaymentSuccess(response, formData) {
    console.log('Payment successful:', response);

    // Calculate amounts for display
    const baseAmount = 30000; // ₦30,000
    let personalizedAmount = 0;
    let personalizedMonths = 0;

    if (formData.personalized_plan === "yes") {
        personalizedMonths = parseInt(formData.personalized_months);
        personalizedAmount = personalizedMonths * 10000; // ₦10,000 per month
    }

    const totalAmount = baseAmount + personalizedAmount;

    // Save enrollment data to localStorage
    try {
        const enrollmentData = {
            ...formData,
            payment_reference: response.reference,
            payment_status: 'completed',
            payment_method: 'paystack',
            base_amount: baseAmount,
            personalized_amount: personalizedAmount,
            total_amount: totalAmount,
            currency: 'NGN',
            submittedAt: new Date().toISOString(),
            transaction_id: response.transaction,
            program: 'LOSE IT 12-Week Weight Loss'
        };

        const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
        enrollments.push(enrollmentData);
        localStorage.setItem("enrollments", JSON.stringify(enrollments));

        // Close the enrollment modal
        document.getElementById('enrollModal').style.display = 'none';

        // Update success modal with payment details
        const successDetails = document.getElementById('successDetails');
        let detailsText = `Amount Paid: ₦${totalAmount.toLocaleString()}`;
        if (personalizedMonths > 0) {
            detailsText += ` (Includes ${personalizedMonths} month${personalizedMonths > 1 ? 's' : ''} personalized plan)`;
        }
        detailsText += `\nReference: ${response.reference}`;
        successDetails.textContent = detailsText;

        // Show success modal
        document.getElementById('paymentSuccessModal').style.display = 'flex';

        // Reset form
        document.getElementById('enrollForm').reset();
        document.getElementById('personalizedOptions').style.display = 'none';
        document.getElementById('personalizedPlan').checked = false;

        console.log('Enrollment saved successfully. Reference:', response.reference);

    } catch (error) {
        console.error('Error saving enrollment data:', error);
        alert('Payment successful but there was an error saving your details. Please contact us with your payment reference: ' + response.reference);
    }
}

// ===== UTILITY FUNCTIONS =====

// View all enrollments (for admin use)
function viewEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    console.log('📋 Current Enrollments:');
    console.table(enrollments);

    // Also show in alert for easy copying
    let message = `Total Enrollments: ${enrollments.length}\n\n`;
    enrollments.forEach((enroll, index) => {
        const amount = enroll.total_amount ? `₦${parseInt(enroll.total_amount).toLocaleString()}` : 'N/A';
        const status = enroll.payment_status || 'unknown';
        message += `${index + 1}. ${enroll.name} - ${enroll.email} - ${amount} - ${status}\n`;
    });
    alert(message);

    return enrollments;
}

// Export enrollments as JSON file
function exportEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const dataStr = JSON.stringify(enrollments, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'loseit-enrollments.json';
    link.click();
}

// Clear all enrollments (for testing)
function clearEnrollments() {
    if (confirm('Are you sure you want to clear ALL enrollment data?')) {
        localStorage.removeItem("enrollments");
        console.log('Enrollments cleared');
        alert('All enrollment data has been cleared.');
    }
}

// Check for new paid enrollments
function checkNewPaidEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const paidEnrollments = enrollments.filter(e => e.payment_status === 'completed');

    console.log(`💰 Paid Enrollments: ${paidEnrollments.length}`);
    paidEnrollments.forEach(enroll => {
        const amount = enroll.total_amount ? `₦${parseInt(enroll.total_amount).toLocaleString()}` : 'N/A';
        const personalized = enroll.personalized_plan === 'yes' ? ` (+${enroll.personalized_months}mo personalized)` : '';
        console.log(`- ${enroll.name} (${enroll.email}) - ${amount}${personalized} - Ref: ${enroll.payment_reference}`);
    });

    return paidEnrollments;
}

// Test Paystack integration
function testPaystack() {
    if (typeof PaystackPop === 'undefined') {
        console.error('Paystack library not loaded');
        return false;
    }
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'pk_test_your_public_key_here') {
        console.error('Paystack public key not configured');
        return false;
    }
    console.log('Paystack integration test: OK');
    return true;
}

// Initialize test on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Paystack integration test:', testPaystack() ? 'PASS' : 'FAIL');
});