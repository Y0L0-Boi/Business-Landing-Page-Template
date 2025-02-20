const onSubmit = async (data: ClientFormData) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          age: parseInt(data.age),
          panNumber: data.panNumber,
          riskAppetite: parseInt(data.riskAppetite),
          profession: data.profession,
          kycStatus: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      toast({
        title: "Success",
        description: "Client registered successfully",
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to register client. Please try again.",
        status: "error",
      });
    }
  };