// Paystack Payment Integration - NGN & USD Support
// Replace with your actual Paystack public key from https://dashboard.paystack.com
const PAYSTACK_PUBLIC_KEY = 'pk_live_ab74bff902b672e6e983b08fe3da6c3042baa2ca';

// Pricing configuration for NGN and USD
const PRICING = {
    NGN: {
        base: 30000,
        personalized: 10000,
        symbol: '₦'
    },
    USD: {
        base: 30,
        personalized: 10,
        symbol: '$'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment system initialized with NGN & USD support');

    const paystackButton = document.getElementById('payWithPaystack');
    const currencySelect = document.getElementById('currencySelect');
    const personalizedPlan = document.getElementById('personalizedPlan');
    const personalizedMonths = document.getElementById('personalizedMonths');

    if (paystackButton) {
        paystackButton.addEventListener('click', processPaystackPayment);
        console.log('Paystack button event listener added');
    } else {
        console.error('Paystack button not found');
    }

    // Currency selection handler
    if (currencySelect) {
        currencySelect.addEventListener('change', handleCurrencyChange);
    }

    // Personalized plan handlers
    if (personalizedPlan) {
        personalizedPlan.addEventListener('change', updatePaymentSummary);
    }
    if (personalizedMonths) {
        personalizedMonths.addEventListener('change', updatePaymentSummary);
    }

    // Initialize Paystack
    if (typeof PaystackPop === 'undefined') {
        console.error('Paystack library not loaded');
        showError('Payment system not loaded properly. Please refresh the page.');
        return;
    }

    // Add admin functions to window for console access
    window.viewEnrollments = viewEnrollments;
    window.exportEnrollments = exportEnrollments;
    window.checkNewPaidEnrollments = checkNewPaidEnrollments;
    window.testPaystack = testPaystack;

    console.log(`
💡 Payment System Ready - NGN & USD Support
Available currencies: NGN (₦) and USD ($)
Admin functions available in console:
- viewEnrollments()
- exportEnrollments() 
- checkNewPaidEnrollments()
- testPaystack()
    `);
});

function handleCurrencyChange() {
    const currency = this.value;
    const paystackSection = document.getElementById('paystackSection');
    const manualPaymentSection = document.getElementById('manualPaymentSection');
    const paymentSummary = document.getElementById('paymentSummary');

    console.log('Currency changed to:', currency);

    // Hide all sections first
    if (paystackSection) paystackSection.style.display = 'none';
    if (manualPaymentSection) manualPaymentSection.style.display = 'none';
    if (paymentSummary) paymentSummary.style.display = 'none';

    if (currency === 'manual') {
        if (manualPaymentSection) manualPaymentSection.style.display = 'block';
        if (paymentSummary) paymentSummary.style.display = 'block';
        updatePaymentSummary();
    } else if (currency === 'NGN' || currency === 'USD') {
        if (paystackSection) paystackSection.style.display = 'block';
        if (paymentSummary) paymentSummary.style.display = 'block';
        updatePaymentSummary();
    }
}

function updatePaymentSummary() {
    const currencySelect = document.getElementById('currencySelect');
    if (!currencySelect) return;

    const currency = currencySelect.value;

    if (!currency || currency === 'manual') {
        // Use NGN as default for manual payments
        updateSummaryWithCurrency('NGN');
    } else {
        updateSummaryWithCurrency(currency);
    }
}

function updateSummaryWithCurrency(currency) {
    const pricing = PRICING[currency];
    const personalizedPlan = document.getElementById('personalizedPlan');
    const personalizedMonths = document.getElementById('personalizedMonths');

    let baseAmount = pricing.base;
    let personalizedAmount = 0;

    if (personalizedPlan && personalizedPlan.checked) {
        const months = personalizedMonths ? parseInt(personalizedMonths.value) : 1;
        personalizedAmount = months * pricing.personalized;
    }

    const totalAmount = baseAmount + personalizedAmount;

    // Format NGN amounts with commas
    const formatAmount = (amount, curr) => {
        if (curr === 'NGN') {
            return `₦${amount.toLocaleString()}`;
        } else {
            return `$${amount}`;
        }
    };

    // Update display
    const baseAmountDisplay = document.getElementById('baseAmountDisplay');
    const personalizedSummary = document.getElementById('personalizedSummary');
    const personalizedAmountDisplay = document.getElementById('personalizedAmount');
    const totalAmountDisplay = document.getElementById('totalAmount');
    const paystackAmountDisplay = document.getElementById('paystackAmount');

    if (baseAmountDisplay) baseAmountDisplay.textContent = formatAmount(baseAmount, currency);
    if (personalizedSummary) personalizedSummary.style.display = (personalizedPlan && personalizedPlan.checked) ? 'flex' : 'none';
    if (personalizedAmountDisplay) personalizedAmountDisplay.textContent = formatAmount(personalizedAmount, currency);
    if (totalAmountDisplay) totalAmountDisplay.textContent = formatAmount(totalAmount, currency);
    if (paystackAmountDisplay) paystackAmountDisplay.textContent = formatAmount(totalAmount, currency);
}

function processPaystackPayment() {
    console.log('Paystack payment process started');

    const form = document.getElementById('enrollForm');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const currencySelect = document.getElementById('currencySelect');
    const currency = currencySelect.value;

    console.log('Form data:', { name, email, phone, currency });

    // Validate required fields
    if (!name || !email || !phone) {
        alert('Please fill in all required fields (Name, Email, and Phone) before proceeding with payment.');
        return;
    }

    // Validate currency selection
    if (currency !== 'NGN' && currency !== 'USD') {
        alert('Please select a valid currency for payment.');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Calculate total amount
    const pricing = PRICING[currency];
    const baseAmount = pricing.base;
    let personalizedAmount = 0;
    let personalizedMonths = 0;

    if (document.getElementById('personalizedPlan').checked) {
        personalizedMonths = parseInt(document.getElementById('personalizedMonths').value);
        personalizedAmount = personalizedMonths * pricing.personalized;
    }

    const totalAmount = baseAmount + personalizedAmount;

    // Convert to smallest currency unit (kobo for NGN, cents for USD)
    const amountInSmallestUnit = totalAmount * 100;

    // Validate Paystack key
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'pk_test_your_public_key_here') {
        showError('Payment system is not properly configured. Please contact support.');
        console.error('Paystack public key not configured');
        return;
    }

    console.log(`Initiating Paystack payment: ${email}, Amount: ${pricing.symbol}${totalAmount}, Currency: ${currency}`);

    // Create payment handler
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amountInSmallestUnit,
        currency: currency,
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
                    display_name: "Current Weight",
                    variable_name: "current_weight",
                    value: form.weight.value
                },
                {
                    display_name: "Goal Weight",
                    variable_name: "goal_weight",
                    value: form.goal.value
                },
                {
                    display_name: "Workout Type",
                    variable_name: "workout_type",
                    value: form.plan.value
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
                },
                {
                    display_name: "Currency",
                    variable_name: "currency",
                    value: currency
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
                currency: currency,
                base_amount: baseAmount,
                personalized_amount: personalizedAmount,
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

    // Save enrollment data to localStorage
    try {
        const enrollmentData = {
            ...formData,
            payment_reference: response.reference,
            payment_status: 'completed',
            payment_method: 'paystack',
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
        const symbol = formData.currency === 'NGN' ? '₦' : '$';

        let amountDisplay = formData.currency === 'NGN'
            ? `${symbol}${formData.total_amount.toLocaleString()}`
            : `${symbol}${formData.total_amount}`;

        let detailsText = `Amount Paid: ${amountDisplay}`;
        if (formData.personalized_plan === "yes") {
            detailsText += ` (Includes ${formData.personalized_months} month${formData.personalized_months > 1 ? 's' : ''} personalized plan)`;
        }
        detailsText += `\nReference: ${response.reference}\nCurrency: ${formData.currency}`;
        successDetails.textContent = detailsText;

        // Show success modal
        document.getElementById('paymentSuccessModal').style.display = 'flex';

        // Reset form
        document.getElementById('enrollForm').reset();
        document.getElementById('personalizedOptions').style.display = 'none';
        document.getElementById('personalizedPlan').checked = false;
        document.getElementById('paymentSummary').style.display = 'none';
        document.getElementById('paystackSection').style.display = 'none';

        console.log('Enrollment saved successfully. Reference:', response.reference);

        // Send confirmation email (you would implement this on your server)
        sendConfirmationEmail(enrollmentData);

    } catch (error) {
        console.error('Error saving enrollment data:', error);
        alert('Payment successful but there was an error saving your details. Please contact us with your payment reference: ' + response.reference);
    }
}

function sendConfirmationEmail(enrollmentData) {
    // This would typically be a server-side function
    console.log('Sending confirmation email to:', enrollmentData.email);

    // Example of what you might send to your backend
    const emailData = {
        to: enrollmentData.email,
        subject: 'Welcome to LOSE IT!!! - Payment Confirmation',
        template: 'payment_confirmation',
        data: {
            name: enrollmentData.name,
            amount: enrollmentData.total_amount,
            currency: enrollmentData.currency,
            reference: enrollmentData.payment_reference,
            program: enrollmentData.program,
            personalized_plan: enrollmentData.personalized_plan,
            personalized_months: enrollmentData.personalized_months
        }
    };

    // You would typically make a fetch request to your backend here
    // fetch('/api/send-confirmation-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(emailData)
    // });
}

function showError(message) {
    alert('Payment Error: ' + message);
}

// ===== ADMIN FUNCTIONS =====

function viewEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    console.log('📋 Current Enrollments:');
    console.table(enrollments);

    let message = `Total Enrollments: ${enrollments.length}\n\n`;
    enrollments.forEach((enroll, index) => {
        const symbol = enroll.currency === 'NGN' ? '₦' : '$';
        let amount = enroll.total_amount || 'N/A';

        // Format NGN amounts with commas
        if (enroll.currency === 'NGN' && typeof amount === 'number') {
            amount = amount.toLocaleString();
        }

        const status = enroll.payment_status || 'unknown';
        const personalized = enroll.personalized_plan === 'yes' ? ` (+${enroll.personalized_months}mo)` : '';
        message += `${index + 1}. ${enroll.name} - ${enroll.email} - ${symbol}${amount}${personalized} - ${status}\n`;
    });
    alert(message);

    return enrollments;
}

function exportEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const dataStr = JSON.stringify(enrollments, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'loseit-enrollments-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function checkNewPaidEnrollments() {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const paidEnrollments = enrollments.filter(e => e.payment_status === 'completed');

    console.log(`💰 Paid Enrollments: ${paidEnrollments.length}`);

    let summary = `Paid Enrollments: ${paidEnrollments.length}\n\n`;
    let totalRevenue = { NGN: 0, USD: 0 };

    paidEnrollments.forEach((enroll, index) => {
        const symbol = enroll.currency === 'NGN' ? '₦' : '$';
        const amount = enroll.total_amount || 0;

        if (enroll.currency === 'NGN') totalRevenue.NGN += amount;
        if (enroll.currency === 'USD') totalRevenue.USD += amount;

        let amountDisplay = enroll.currency === 'NGN'
            ? `${symbol}${amount.toLocaleString()}`
            : `${symbol}${amount}`;

        const personalized = enroll.personalized_plan === 'yes' ? ` (+${enroll.personalized_months}mo)` : '';
        summary += `${index + 1}. ${enroll.name} - ${amountDisplay}${personalized} - ${enroll.payment_reference}\n`;
    });

    summary += `\nTotal Revenue:\n₦${totalRevenue.NGN.toLocaleString()} NGN\n$${totalRevenue.USD} USD`;
    alert(summary);

    return paidEnrollments;
}

function testPaystack() {
    if (typeof PaystackPop === 'undefined') {
        console.error('Paystack library not loaded');
        alert('Paystack library not loaded. Please check the script tag.');
        return false;
    }
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'pk_test_your_public_key_here') {
        console.error('Paystack public key not configured');
        alert('Paystack public key not configured. Please update PAYSTACK_PUBLIC_KEY.');
        return false;
    }
    console.log('Paystack integration test: OK');
    alert('Paystack integration test: PASS - Library loaded and key configured');
    return true;
}