<<<<<<< HEAD
// Paystack Payment Integration - Pounds (£) Pricing
const PAYSTACK_PUBLIC_KEY = "pk_live_ab74bff902b672e6e983b08fe3da6c3042baa2ca"; // Replace with your actual Paystack public key

document.addEventListener('DOMContentLoaded', function() {
  const paystackButton = document.getElementById('payWithPaystack');
  if (paystackButton) {
    paystackButton.addEventListener('click', processPaystackPayment);
  }
=======
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
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232
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

<<<<<<< HEAD
  // === Convert Pounds to Kobo equivalent (Paystack requires amount in kobo) ===
  // £1 = ₦1,700 (example — Paystack accepts NGN backend even for GBP charge display)
  // To actually charge in GBP, your Paystack account must support multi-currency. So we use GBP as currency.
  const baseAmount = 30 * 100; // £30 in pence
  let personalizedAmount = 0;
  let personalizedMonths = 0;

  if (document.getElementById('personalizedPlan').checked) {
    personalizedMonths = parseInt(document.getElementById('personalizedMonths').value);
    personalizedAmount = personalizedMonths * 10 * 100; // £10 per month in pence
  }
=======
    // Calculate total amount in kobo (1 Naira = 100 kobo)
    const baseAmount = 30000 * 100; // ₦30,000 in kobo
    let personalizedAmount = 0;
    let personalizedMonths = 0;

    if (document.getElementById('personalizedPlan').checked) {
        personalizedMonths = parseInt(document.getElementById('personalizedMonths').value);
        personalizedAmount = personalizedMonths * 10000 * 100; // ₦10,000 per month in kobo
    }
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232

  const totalAmount = baseAmount + personalizedAmount;

<<<<<<< HEAD
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: totalAmount,
    currency: 'GBP',
    ref: 'LOSEIT_' + Math.floor((Math.random() * 1000000000) + 1),
    metadata: {
      custom_fields: [
        { display_name: "Full Name", variable_name: "full_name", value: name },
        { display_name: "Phone Number", variable_name: "phone_number", value: phone },
        { display_name: "Program", variable_name: "program", value: "LOSE IT 12-Week Weight Loss" },
        { display_name: "Personalized Plan", variable_name: "personalized_plan", value: personalizedMonths > 0 ? `Yes (${personalizedMonths} months)` : "No" }
      ]
    },
    callback: function(response) {
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
      console.log('Payment window closed.');
      alert('Payment was not completed. You can try again anytime.');
    }
  });
=======
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
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232

  handler.openIframe();
}

function handlePaymentSuccess(response, formData) {
  console.log('Payment successful:', response);

  const baseAmount = 30;
  let personalizedAmount = 0;
  let personalizedMonths = 0;

  if (formData.personalized_plan === "yes") {
    personalizedMonths = parseInt(formData.personalized_months);
    personalizedAmount = personalizedMonths * 10;
  }

  const totalAmount = baseAmount + personalizedAmount;

  try {
    const enrollmentData = {
      ...formData,
      payment_reference: response.reference,
      payment_status: 'completed',
      payment_method: 'paystack',
      base_amount: baseAmount,
      personalized_amount: personalizedAmount,
      total_amount: totalAmount,
      currency: 'GBP',
      submittedAt: new Date().toISOString(),
      program: 'LOSE IT 12-Week Weight Loss'
    };

    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    enrollments.push(enrollmentData);
    localStorage.setItem("enrollments", JSON.stringify(enrollments));

    document.getElementById('enrollModal').style.display = 'none';
    const successDetails = document.getElementById('successDetails');
    let detailsText = `Amount Paid: £${totalAmount.toLocaleString()}`;
    if (personalizedMonths > 0) {
      detailsText += ` (Includes ${personalizedMonths} month${personalizedMonths > 1 ? 's' : ''} personalized plan)`;
    }
    successDetails.textContent = detailsText;
    document.getElementById('paymentSuccessModal').style.display = 'flex';
    document.getElementById('enrollForm').reset();

    console.log('Enrollment saved successfully. Reference:', response.reference);

  } catch (error) {
    console.error('Error saving enrollment data:', error);
    alert('Payment successful but there was an error saving your details. Please contact us with your payment reference: ' + response.reference);
  }
}

// === Manual Payment ===
document.addEventListener('DOMContentLoaded', function() {
  const manualSubmit = document.getElementById('submitManual');
  if (manualSubmit) {
    manualSubmit.addEventListener('click', function(e) {
      e.preventDefault();

      const form = document.getElementById('enrollForm');
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();

      if (!name || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
      }

      const baseAmount = 30;
      let personalizedAmount = 0;
      let personalizedMonths = 0;

      if (document.getElementById('personalizedPlan').checked) {
        personalizedMonths = parseInt(document.getElementById('personalizedMonths').value);
        personalizedAmount = personalizedMonths * 10;
      }

      const totalAmount = baseAmount + personalizedAmount;

      try {
        const enrollmentData = {
          name,
          email,
          phone,
          weight: form.weight.value,
          goal: form.goal.value,
          plan: form.plan.value,
          personalized_plan: document.getElementById('personalizedPlan').checked ? "yes" : "no",
          personalized_months: personalizedMonths.toString(),
          base_amount: baseAmount,
          personalized_amount: personalizedAmount,
          total_amount: totalAmount,
          payment_method: 'manual',
          payment_status: 'pending',
          currency: 'GBP',
          submittedAt: new Date().toISOString(),
          program: 'LOSE IT 12-Week Weight Loss'
        };

        const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
        enrollments.push(enrollmentData);
        localStorage.setItem("enrollments", JSON.stringify(enrollments));

        document.getElementById('successMessage').style.display = 'block';
        form.reset();

<<<<<<< HEAD
        setTimeout(() => {
          document.getElementById('successMessage').style.display = 'none';
          document.getElementById('enrollModal').style.display = 'none';
        }, 3000);

      } catch (error) {
        console.error('Error saving manual enrollment:', error);
        alert('There was an error submitting your enrollment. Please try again.');
      }
    });
  }
});

// === Admin / Utility Functions ===
=======
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
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232
function viewEnrollments() {
  const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
  console.log('📋 Current Enrollments:');
  console.table(enrollments);

<<<<<<< HEAD
  let message = `Total Enrollments: ${enrollments.length}\n\n`;
  enrollments.forEach((enroll, index) => {
    const amount = enroll.total_amount ? `£${parseInt(enroll.total_amount).toLocaleString()}` : 'N/A';
    message += `${index + 1}. ${enroll.name} - ${enroll.email} - ${amount} - ${enroll.payment_status}\n`;
  });
  alert(message);
=======
    // Also show in alert for easy copying
    let message = `Total Enrollments: ${enrollments.length}\n\n`;
    enrollments.forEach((enroll, index) => {
        const amount = enroll.total_amount ? `₦${parseInt(enroll.total_amount).toLocaleString()}` : 'N/A';
        const status = enroll.payment_status || 'unknown';
        message += `${index + 1}. ${enroll.name} - ${enroll.email} - ${amount} - ${status}\n`;
    });
    alert(message);
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232

  return enrollments;
}

function exportEnrollments() {
  const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
  const dataStr = JSON.stringify(enrollments, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'loseit-enrollments.json';
  link.click();
}

function clearEnrollments() {
  if (confirm('Are you sure you want to clear ALL enrollment data?')) {
    localStorage.removeItem("enrollments");
    alert('All enrollment data has been cleared.');
  }
}

function checkNewPaidEnrollments() {
<<<<<<< HEAD
  const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
  const paidEnrollments = enrollments.filter(e => e.payment_status === 'completed');
  console.log(`💰 Paid Enrollments: ${paidEnrollments.length}`);
  paidEnrollments.forEach(enroll => {
    const amount = enroll.total_amount ? `£${parseInt(enroll.total_amount).toLocaleString()}` : 'N/A';
    const personalized = enroll.personalized_plan === 'yes' ? ` (+${enroll.personalized_months}mo personalized)` : '';
    console.log(`- ${enroll.name} (${enroll.email}) - ${amount}${personalized} - Ref: ${enroll.payment_reference}`);
  });
  return paidEnrollments;
}
=======
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
>>>>>>> 5900a6dfd8abc0157c85abdaa22334e1e9f61232
