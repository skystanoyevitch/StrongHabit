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
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ColorPicker from "react-native-wheel-color-picker";
import { Habit, DayOfWeek } from "../types/habit";
import { sharedStyles } from "../styles/shared";
import { AnimatedTitle } from "./AnimatedTitle";
import { DaySelection } from "./DaySelection";
import { MonthlySelection } from "./MonthlySelection";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../constants/theme"; // Import theme

// Define form input type (exclude auto-generated fields)
type HabitFormInput = Omit<
  Habit,
  "id" | "createdAt" | "streak" | "completionLogs"
> & {
  reminderEnabled: boolean;
  color: string;
  selectedDays: DayOfWeek[];
  monthlyDays?: number[];
};

// Define initial form state
const initialFormState: HabitFormInput = {
  name: "",
  description: "",
  frequency: "daily",
  selectedDays: [],
  monthlyDays: [],
  reminderEnabled: false,
  color: theme.colors.primary, // Default to the primary theme color
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  // Function to handle time selection
  const handleTimeChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;
      handleChange("reminderTime", timeString);
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

    // Frequency validation
    if (formData.frequency === "weekly" && formData.selectedDays.length === 0) {
      newErrors.selectedDays = "Please select at least one day";
    }

    // Monthly frequency validation
    if (
      formData.frequency === "monthly" &&
      (!formData.monthlyDays || formData.monthlyDays.length === 0)
    ) {
      newErrors.monthlyDays = "Please select at least one day of the month";
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
    "#0F4D92", // Theme primary
    "#FF2D55", // Theme accent
    "#4CAF50", // Green
    "#FFC107", // Amber
    "#2196F3", // Blue
    "#9C27B0", // Purple
    "#E91E63", // Pink
    "#795548", // Brown
  ]; // Use a predefined list of colors

  // Update the title based on whether we're editing
  const formTitle = isEditing ? "Edit Habit" : "Create a New Habit";
  // Update submit button text
  const submitButtonText = isEditing ? "Update Habit" : "Create Habit";

  // Color Selection Section (replace the existing color selection section)
  const renderColorPicker = () => (
    <Modal
      visible={showColorPicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowColorPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.colorPickerModal}>
          <Text style={styles.colorPickerTitle}>Choose Your Color</Text>
          <View style={styles.colorPickerWrapper}>
            <ColorPicker
              color={formData.color}
              onColorChange={(color) => handleChange("color", color)}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              row={false}
            />
          </View>
          <View style={styles.predefinedColors}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.predefinedColor,
                  { backgroundColor: color },
                  formData.color === color && styles.selectedPredefinedColor,
                ]}
                onPress={() => handleChange("color", color)}
              />
            ))}
          </View>
          <View style={styles.colorPickerActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#0F4D92" }]}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.submitButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AnimatedTitle text={formTitle} />

        {/* Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Habit Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Enter habit name"
            placeholderTextColor={theme.colors.placeholder} // Use theme placeholder color
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
            placeholderTextColor={theme.colors.placeholder} // Use theme placeholder color
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
              <Text
                style={[
                  styles.radioText,
                  formData.frequency === "daily" && styles.radioTextSelected,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.frequency === "weekly" && styles.radioSelected,
              ]}
              onPress={() => handleChange("frequency", "weekly")}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.frequency === "weekly" && styles.radioTextSelected,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.frequency === "monthly" && styles.radioSelected,
              ]}
              onPress={() => handleChange("frequency", "monthly")}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.frequency === "monthly" && styles.radioTextSelected,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selection */}
        {formData.frequency === "weekly" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Days</Text>
            <DaySelection
              selectedDays={formData.selectedDays}
              onDaySelect={(day) => {
                const newSelectedDays = formData.selectedDays.includes(day)
                  ? formData.selectedDays.filter((d) => d !== day)
                  : [...formData.selectedDays, day];
                handleChange("selectedDays", newSelectedDays);
              }}
            />
            {errors.selectedDays && (
              <Text style={styles.errorText}>{errors.selectedDays}</Text>
            )}
          </View>
        )}

        {/* Monthly Day Selection */}
        {formData.frequency === "monthly" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Days</Text>
            <MonthlySelection
              selectedDays={formData.monthlyDays || []}
              onDaySelect={(day) => {
                const newSelectedDays = formData.monthlyDays?.includes(day)
                  ? formData.monthlyDays.filter((d) => d !== day)
                  : [...(formData.monthlyDays || []), day];
                handleChange("monthlyDays", newSelectedDays);
              }}
            />
            {errors.selectedDays && (
              <Text style={styles.errorText}>{errors.selectedDays}</Text>
            )}
          </View>
        )}

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

        {/* Time Picker (only show when reminderEnabled is true) */}
        {formData.reminderEnabled && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formData.reminderTime
                  ? `${formData.reminderTime}`
                  : "Set time (tap to select)"}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={
                  formData.reminderTime
                    ? (() => {
                        const [hours, minutes] = formData.reminderTime
                          .split(":")
                          .map(Number);
                        const date = new Date();
                        date.setHours(hours);
                        date.setMinutes(minutes);
                        return date;
                      })()
                    : new Date()
                }
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(Platform.OS === "ios");
                  handleTimeChange(selectedDate);
                }}
              />
            )}
          </View>
        )}

        {/* Color Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Color</Text>
          <TouchableOpacity
            style={styles.colorPickerPreview}
            onPress={() => setShowColorPicker(true)}
          >
            <View
              style={[styles.colorSwatch, { backgroundColor: formData.color }]}
            />
            <Text style={styles.colorPickerButtonText}>Select Color</Text>
            <MaterialCommunityIcons name="palette" size={24} color="#0F4D92" />
          </TouchableOpacity>
        </View>

        {/* Color Picker Modal */}
        <Modal
          visible={showColorPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.colorPickerModal}>
              <Text style={styles.colorPickerTitle}>Choose Your Color</Text>
              <View style={styles.colorPickerWrapper}>
                <ColorPicker
                  color={formData.color}
                  onColorChange={(color) => handleChange("color", color)}
                  thumbSize={40}
                  sliderSize={40}
                  noSnap={true}
                  row={false}
                />
              </View>
              <View style={styles.predefinedColors}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.predefinedColor,
                      { backgroundColor: color },
                      formData.color === color &&
                        styles.selectedPredefinedColor,
                    ]}
                    onPress={() => handleChange("color", color)}
                  />
                ))}
              </View>
              <View style={styles.colorPickerActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowColorPicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#0F4D92" }]}
                  onPress={() => setShowColorPicker(false)}
                >
                  <Text style={styles.submitButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    backgroundColor: theme.colors.surface, // Use theme surface color
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: theme.fonts.titleMedium, // Use Quicksand Medium
    fontSize: 16,
    // fontWeight: "500", // fontWeight is part of fontFamily now
    marginBottom: 8,
    color: theme.colors.text, // Use theme text color
  },
  input: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    borderWidth: 0.5,
    borderColor: theme.colors.outline, // Use theme outline color
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surface, // Use theme surface color
    color: theme.colors.text, // Use theme text color for input
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.colors.error, // Use theme error color
  },
  errorText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    color: theme.colors.error, // Use theme error color
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
    borderWidth: 0.5,
    borderColor: theme.colors.primary, // Use theme primary color
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: theme.colors.primary, // Use theme primary color
  },
  radioText: {
    fontFamily: theme.fonts.medium, // Use Inter Medium
    color: theme.colors.primary, // Use theme primary color
    // fontWeight: "500", // fontWeight is part of fontFamily now
  },
  radioTextSelected: {
    color: theme.colors.contrastPrimary, // Use contrast color for text on primary background
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
    // General button style, used by cancel
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    // Specific for submit
    backgroundColor: theme.colors.primary, // Use theme primary color
    flex: 1, // Takes remaining space if no cancel button or if specified
  },
  submitButtonText: {
    fontFamily: theme.fonts.semibold, // Use Inter Semibold
    color: theme.colors.contrastPrimary, // Use contrast color
    fontSize: 16,
    // fontWeight: "600", // fontWeight is part of fontFamily now
  },
  cancelButton: {
    // Specific for cancel
    backgroundColor: "transparent", // Or theme.colors.surface if needs a background
    marginRight: 12,
    // borderWidth: 1, // Optional: if you want a border
    // borderColor: theme.colors.outline, // Optional: if you want a border
  },
  cancelButtonText: {
    fontFamily: theme.fonts.medium, // Use Inter Medium
    color: theme.colors.text, // Use theme text color (or primary for more emphasis)
    fontSize: 16,
    // fontWeight: "500", // fontWeight is part of fontFamily now
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorPickerModal: {
    backgroundColor: theme.colors.surface, // Use theme surface color
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  colorPickerTitle: {
    fontFamily: theme.fonts.titleSemibold, // Use Quicksand Semibold
    fontSize: 18,
    // fontWeight: "600", // fontWeight is part of fontFamily now
    marginBottom: 20,
    textAlign: "center",
    color: theme.colors.text, // Use theme text color
  },
  colorPickerWrapper: {
    height: 300,
    marginBottom: 20,
  },
  predefinedColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  predefinedColor: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedPredefinedColor: {
    borderColor: "#007AFF",
  },
  colorPickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  timePickerText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    fontSize: 16,
    color: theme.colors.text, // Use theme text color
  },
  doneButtonText: {
    // For modal done button
    fontFamily: theme.fonts.semibold, // Use Inter Semibold
    color: theme.colors.primary, // Use theme primary color
    fontSize: 18,
    // fontWeight: "600", // fontWeight is part of fontFamily now
  },
  colorPickerPreview: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.outline,
    borderRadius: 24,
    padding: 12,
    backgroundColor: theme.colors.surface, // Use theme surface color
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 24,
    marginRight: 8,
  },
  colorPickerButtonText: {
    fontFamily: theme.fonts.regular, // Use Inter Regular
    flex: 1,
    fontSize: 16,
    color: theme.colors.text, // Use theme text color
  },
});
