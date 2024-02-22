function displayCategoryExpenses(expensesData) {
    const categories = ['groceries', 'utilities', 'transport', 'education', 'entertainment', 'uncategorised'];
  
    for (const category of categories) {
        let total = 0;
        const categoryExpensesContainer = $(`#${category}Expenses`);
  
        categoryExpensesContainer.empty();
  
        for (const expense of expensesData) {
            if (expense.expenseType === category) {
                const expenseCost = parseFloat(expense.expense_cost);
                if (!isNaN(expenseCost)) {
                    total += expenseCost;
                }
            }
        }
        categoryExpensesContainer.append(`<h2 class='expenseTitle'>$${total}</h2>`);
    }
  }
  
  function displayExpensesOnHomepage() {
    // Retrieve local expenses from local storage
    const savedData = localStorage.getItem('expensesData');
    let expensesData = [];
  
    if (savedData) {
        expensesData = JSON.parse(savedData);
    }
  
    // Retrieve cloud expenses from the server
    $.ajax({
        url: `http://localhost:3000/getCloudData`,
        type: "GET",
        success: function(cloudData) {
            const allExpenses = expensesData.concat(cloudData);
            displayCategoryExpenses(allExpenses);
        },
        error: function(error) {
            alert("Error retrieving cloud data: " + error.responseText);
        },
    });
  }
  
  displayExpensesOnHomepage();
  
  
  function calculateTotalExpenses(expensesData) {
    let total = 0;
    if (expensesData && expensesData.length > 0) {
        for (const expense of expensesData) {
            const expenseCost = parseFloat(expense.expense_cost);
            if (!isNaN(expenseCost)) {
                total += expenseCost;
            }
        }
    }
    return total;
  }
  
  function displayExpenses(expensesData, categoryFilter) {
    var expenseList = $("#expenseList");
    expenseList.empty(); // Clear the list
  
    if (expensesData && expensesData.length > 0) {
        for (const expense of expensesData) {
            if (categoryFilter === 'all' || expense.expenseType === categoryFilter) {
                var listItem = $("<li>");
                var cardContent = $("<div>");
                cardContent.append("<h2>" + expense.expenseType + "</h2>");
                cardContent.append("<p>Date: " + formatDate(expense.expense_date) + "</p>");
                cardContent.append("<p>Cost: $" + expense.expense_cost + "</p>");
                cardContent.append("<p>Remarks: " + (expense.expense_remarks || "-") + "</p>");
                listItem.append(cardContent);
                expenseList.append(listItem);
            }
        }
        expenseList.listview().listview("refresh");
    } else {
        // If there are no expenses, display a "No data" message
        expenseList.html('<li>No data</li>');
    }
  }
  
  function displayTotalExpenses(totalExpenses) {
    $("#totalExpenses").text("$" + totalExpenses);
  }
  
  function calculateTotalCloudExpenses(cloudData) {
    let total = 0;
    if (cloudData && cloudData.length > 0) {
        for (const expense of cloudData) {
            const expenseCost = parseFloat(expense.expense_cost);
            if (!isNaN(expenseCost)) {
                total += expenseCost;
            }
        }
    }
    return total;
  }
  
  function displayCloudExpenses(cloudData) {
    var cloudExpenseList = $("#cloudExpenseList");
    cloudExpenseList.empty(); // Clear the list
  
    if (cloudData && cloudData.length > 0) {
        for (const expense of cloudData) {
            var listItem = $("<li>");
            var cardContent = $("<div>");
            cardContent.append("<h2>" + expense.expenseType + "</h2>");
            cardContent.append("<p>Date: " + formatDate(expense.expense_date) + "</p>");
            cardContent.append("<p>Cost: $" + expense.expense_cost + "</p>");
            cardContent.append("<p>Remarks: " + (expense.expense_remarks || "-") + "</p>");
            listItem.append(cardContent);
            cloudExpenseList.append(listItem);
        }
        cloudExpenseList.listview().listview("refresh");
  
        // Calculate and display the total expenses for cloud data
        const totalExpenses = calculateTotalCloudExpenses(cloudData);
        $("#totalCloudExpenses").text("$" + totalExpenses); 
    } else {
        // If there is no cloud data, display a "No data"
        cloudExpenseList.html('<li>No cloud data</li>');
        $("#totalCloudExpenses").text("$0"); 
    }
  }
  
  function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  //To validate the date not greater than todays date
  function isDateValid(selectedDate) {
    const currentDate = new Date();
    const selectedDateObj = new Date(selectedDate);
    return selectedDateObj <= currentDate;
  }
  
  function displayNoData() {
    $("#expenseList").html('<li>No data</li>');
    $("#totalExpenses").text("$0");
  
  }
  
  (function() {
  
    let selectedCategory = 'all'; // Initialize with 'all' category
  
    // Define a function to handle category filter changes
    function handleCategoryFilterChange() {
        const savedData = localStorage.getItem('expensesData');
  
        if (savedData) {
            const expensesData = JSON.parse(savedData);
            // Filter expenses based on the selected category
            const filteredExpenses = expensesData.filter(expense => selectedCategory === 'all' || expense.expenseType === selectedCategory);
            // Calculate and display total expenses for the filtered data
            const totalExpenses = calculateTotalExpenses(filteredExpenses);
            displayTotalExpenses(totalExpenses);
            // Display existing expenses with the selected category filter
            displayExpenses(filteredExpenses, selectedCategory);
        } else {
            // If there's no data, display a "No data" message
            displayNoData();
        }
    }
  
    // Function to initialize the page
    function initializePage() {
        const baseURL = 'http://localhost:3000';
  
        // Handle the "Filter by Category" select change event
        $("#categoryFilter").on("change", function() {
            selectedCategory = $(this).val();
            handleCategoryFilterChange();
        });
  
        // Trigger the initial data display (show all data)
        handleCategoryFilterChange();
  
        // Handle the "Open Camera" button click
        $('#clickPicture').on('click', function() {
            // Define camera options
            var cameraOptions = {
                quality: 50, // Image quality (0-100)
                destinationType: Camera.DestinationType.DATA_URL, // Return base64 data
                sourceType: Camera.PictureSourceType.CAMERA, // Use the device camera
                encodingType: Camera.EncodingType.JPEG, // Image format
                saveToPhotoAlbum: false // Do not save to the device's photo album
            };
  
            // Use Cordova Camera API to open the camera
            navigator.camera.getPicture(
                function(imageData) {
                    // Display the captured image in the specified div
                    var img = document.createElement('img');
                    img.src = 'data:image/jpeg;base64,' + imageData;
                    $('#clickedReciept').html(img);
                },
                function(error) {
                    // Handle any errors here
                    console.error('Camera Error: ' + error);
                },
                cameraOptions
            );
        });
  
  
        $("#expenseDetailsForm").validate({
            submitHandler: function(form) {
                const selectedDate = $(form).find("input[name='expense_date']").val();
                if (!isDateValid(selectedDate)) {
                    alert("Selected date cannot be greater than today's date.");
                    return;
                }
                var formData = $(form).serializeArray();
                var formObject = {};
  
                // Convert form data into an object
                formData.forEach(function(field) {
                    formObject[field.name] = field.value;
                });
                // Retrieve existing expenses from local storage
                var expensesData = JSON.parse(localStorage.getItem("expensesData")) || [];
                // Add the new expense to the array
                expensesData.push(formObject);
                // Store the updated expenses array in local storage
                localStorage.setItem("expensesData", JSON.stringify(expensesData));
                // Reset the form
                $("#expenseDetailsForm")[0].reset();
                displayExpensesOnHomepage();
                // Display a success message or redirect to another page
                alert("Expense added successfully");
            }
        });
  
        // Load existing data from localStorage (if any)
        const savedData = localStorage.getItem('expensesData');
        // Log the expenses data in JSON format to the console
        if (savedData) {
            const expensesData = JSON.parse(savedData);
            // Calculate and display total expenses
            const totalExpenses = calculateTotalExpenses(expensesData);
            displayTotalExpenses(totalExpenses);
            // Display existing expenses
            displayExpenses(expensesData);
        } else {
            // If there's no data
            displayNoData();
        }
  
        // Add click event handler for the "Delete Local Data" button
        $("#deleteLocalButton").on("click", function() {
            var expensesData = JSON.parse(localStorage.getItem("expensesData"));
  
            if (expensesData && expensesData.length > 0) {
                var confirmation = confirm("Are you sure you want to delete local data?");
                if (confirmation) {
                    // Clear local data if confirmed
                    localStorage.removeItem("expensesData");
                    displayExpensesOnHomepage();
                    alert("Local data cleared successfully.");
                } else {
                    // Do nothing if canceled
                    alert("Deletion Canceled.");
                }
            } else {
                alert("No local data to delete.");
            }
        });
  
        // upload to cloud
        $("#uploadToCloud").on("click", function() {
            var savedData = localStorage.getItem('expensesData');
  
            if (savedData) {
                var expensesData = JSON.parse(savedData);
                $.ajax({
                    url: `${baseURL}/uploadData`,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(expensesData),
                    success: function(response) {
                        alert("All data uploaded to the cloud successfully.");
                        $.ajax({
                            url: `http://localhost:3000/getCloudData`,
                            type: "GET",
                            success: function(cloudData) {
                                displayCloudExpenses(cloudData);
                                displayExpensesOnHomepage();
                            },
                            error: function(error) {
                                alert("Error retrieving cloud data: " + error.responseText);
                            },
                        });
                        // Clear local data
                        localStorage.removeItem("expensesData");
                        // Reset the form
                        $("#expenseDetailsForm")[0].reset();
                        // Display a message indicating there is no data
                        displayNoData();
                    },
                    error: function(error) {
                        alert("Error uploading data to the cloud: " + error.responseText);
                    },
                });
            } else {
                alert("No data to upload.");
            }
        });
  
  
        // Delete All Cloud Data 
        $("#deleteAllCloudButton").on("click", function() {
            $.ajax({
                url: `${baseURL}/deleteCloudData`,
                method: "GET",
                success: function(response) {
                    alert("All cloud data deleted successfully.");
                    displayCloudExpenses([]);
                    displayExpensesOnHomepage();
                },
                error: function(error) {
                    alert("Error deleting data from the cloud: " + error.responseText);
                },
            });
        });
    }
    $(document).ready(initializePage);
  
    $(document).on("pagecreate", function(event) {
        const pageId = event.target.id;
        const savedData = localStorage.getItem('expensesData');
        let expensesData = [];
  
        if (savedData) {
            expensesData = JSON.parse(savedData);
        }
  
        if (pageId === "localExpenseShow") {
            if (expensesData.length > 0) {
                displayExpenses(expensesData, 'all');
                // displayCategoryExpenses(expensesData);
            } else {
                $("#expenseList").html('<li>No data</li>');
            }
        } else if (pageId === "cloudExpenseShow") {
            $.ajax({
                url: `http://localhost:3000/getCloudData`,
                type: "GET",
                success: function(cloudData) {
                    displayCloudExpenses(cloudData);
                    // displayCategoryExpenses(cloudData);
                },
                error: function(error) {
                    alert("Error retrieving cloud data: " + error.responseText);
                },
            });
        }
    });
  
  })();