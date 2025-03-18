import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Habit } from "../types/habit";

// Define form input type (exclude auto-generated fields)
type HabitFormInput = Omit<
  Habit,
  "id" | "createdAt" | "streak" | "completionLogs"
> & {
  reminderEnabled: boolean;
  color: string;
};

// Define initial form state
const initialFormState: HabitFormInput = {
  name: "",
  description: "",
  frequency: "daily",
  reminderEnabled: false,
  color: "#007AFF",
};

interface HabitFormProps {
  onSubmit: (habit: HabitFormInput) => void;
  onCancel?: () => void;
  initialValues?: HabitFormInput;
  isEditing?: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
}) => {
  // Update form state initialization to use initialValues if provided
  const [formData, setFormData] = useState<HabitFormInput>(
    initialValues || initialFormState
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof HabitFormInput, string>>
  >({});

  // Form field update handler
  const handleChange = (field: keyof HabitFormInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HabitFormInput, string>> = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = "Habit name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    // Description length validation (optional field)
    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      // Reset form after submission
      setFormData(initialFormState);
    }
  };

  // Color selection component
  const ColorOption = ({
    color,
    selected,
    onSelect,
  }: {
    color: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selected && styles.selectedColorOption,
      ]}
      onPress={onSelect}
    />
  );

  // Available colors
  const colorOptions = [
    "#007AFF", // Blue
    "#FF3B30", // Red
    "#4CD964", // Green
    "#FF9500", // Orange
    "#5856D6", // Purple
    "#FF2D55", // Pink
  ];

  // Update the title based on whether we're editing
  const formTitle = isEditing ? "Edit Habit" : "Create New Habit";

  // Update submit button text
  const submitButtonText = isEditing ? "Update Habit" : "Create Habit";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{formTitle}</Text>

        {/* Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Habit Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Enter habit name"
            maxLength={60}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Frequency Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.frequency === "daily" && styles.radioSelected,
              ]}
              onPress={() => handleChange("frequency", "daily")}
            >
              <Text style={styles.radioText}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.frequency === "weekly" && styles.radioSelected,
              ]}
              onPress={() => handleChange("frequency", "weekly")}
            >
              <Text style={styles.radioText}>Weekly</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminder Toggle */}
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Set Reminder</Text>
            <Switch
              value={formData.reminderEnabled}
              onValueChange={(value) => handleChange("reminderEnabled", value)}
              trackColor={{ false: "#ccc", true: "#007AFF" }}
              thumbColor={formData.reminder ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorContainer}>
            {colorOptions.map((color) => (
              <ColorOption
                key={color}
                color={color}
                selected={formData.color === color}
                onSelect={() => handleChange("color", color)}
              />
            ))}
          </View>
        </View>

        {/* Form Actions */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{submitButtonText}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 10,
  },
  radioOption: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: "#007AFF",
  },
  radioText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    flex: 1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    marginRight: 12,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
});
