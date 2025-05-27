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
import { theme } from "../constants/theme";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

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
  startDate: new Date().toISOString().split("T")[0], // Add startDate to initial form state
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
  ];

  // Update the title based on whether we're editing
  const formTitle = isEditing ? "Edit Habit" : "Create a New Habit";
  // Update submit button text
  const submitButtonText = isEditing ? "Update Habit" : "Create Habit";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={styles.formGroup}
        >
          <Text style={styles.label}>
            <MaterialCommunityIcons
              name="format-title"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Habit Name *
          </Text>
          <View
            style={[
              styles.inputContainer,
              focusedField === "name" && styles.inputContainerFocused,
              errors.name && styles.inputContainerError,
            ]}
          >
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter habit name"
              placeholderTextColor={theme.colors.placeholder}
              maxLength={60}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </Animated.View>

        {/* Description Input */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={styles.formGroup}
        >
          <Text style={styles.label}>
            <MaterialCommunityIcons
              name="text"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Description (Optional)
          </Text>
          <View
            style={[
              styles.inputContainer,
              styles.textAreaContainer,
              focusedField === "description" && styles.inputContainerFocused,
              errors.description && styles.inputContainerError,
            ]}
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Why is this habit important to you?"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={3}
              maxLength={200}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </Animated.View>

        {/* Frequency Selection */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          style={styles.formGroup}
        >
          <Text style={styles.label}>
            <MaterialCommunityIcons
              name="calendar-refresh"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Frequency
          </Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                formData.frequency === "daily" && styles.radioSelected,
              ]}
              onPress={() => handleChange("frequency", "daily")}
            >
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color={
                  formData.frequency === "daily"
                    ? theme.colors.contrastPrimary
                    : theme.colors.primary
                }
              />
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
              <MaterialCommunityIcons
                name="calendar-week"
                size={20}
                color={
                  formData.frequency === "weekly"
                    ? theme.colors.contrastPrimary
                    : theme.colors.primary
                }
              />
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
              <MaterialCommunityIcons
                name="calendar-month"
                size={20}
                color={
                  formData.frequency === "monthly"
                    ? theme.colors.contrastPrimary
                    : theme.colors.primary
                }
              />
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
        </Animated.View>

        {/* Day Selection */}
        {formData.frequency === "weekly" && (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.formGroup}
          >
            <Text style={styles.label}>
              <MaterialCommunityIcons
                name="calendar-week"
                size={18}
                color={theme.colors.primary}
              />{" "}
              Select Days
            </Text>
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
          </Animated.View>
        )}

        {/* Monthly Day Selection */}
        {formData.frequency === "monthly" && (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.formGroup}
          >
            <Text style={styles.label}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={18}
                color={theme.colors.primary}
              />{" "}
              Select Days
            </Text>
            <View style={styles.monthlySelectionContainer}>
              <MonthlySelection
                selectedDays={formData.monthlyDays || []}
                onDaySelect={(day) => {
                  const newSelectedDays = formData.monthlyDays?.includes(day)
                    ? formData.monthlyDays.filter((d) => d !== day)
                    : [...(formData.monthlyDays || []), day];
                  handleChange("monthlyDays", newSelectedDays);
                }}
              />
            </View>
            {errors.selectedDays && (
              <Text style={styles.errorText}>{errors.selectedDays}</Text>
            )}
          </Animated.View>
        )}

        {/* Reminder Toggle */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={styles.formGroup}
        >
          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <MaterialCommunityIcons
                name="bell"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>Set Reminder</Text>
            </View>
            <Switch
              value={formData.reminderEnabled}
              onValueChange={(value) => handleChange("reminderEnabled", value)}
              trackColor={{ false: "#ccc", true: theme.colors.primary + "80" }}
              thumbColor={
                formData.reminderEnabled ? theme.colors.primary : "#f4f3f4"
              }
            />
          </View>
        </Animated.View>

        {/* Time Picker (only show when reminderEnabled is true) */}
        {formData.reminderEnabled && (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.formGroup}
          >
            <Text style={styles.label}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={theme.colors.primary}
              />{" "}
              Reminder Time
            </Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialCommunityIcons
                name="clock"
                size={22}
                color={theme.colors.primary}
              />
              <Text style={styles.timePickerText}>
                {formData.reminderTime
                  ? `${formData.reminderTime}`
                  : "Set time (tap to select)"}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={theme.colors.secondaryText}
              />
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
          </Animated.View>
        )}

        {/* Color Selection */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(500)}
          style={styles.formGroup}
        >
          <Text style={styles.label}>
            <MaterialCommunityIcons
              name="palette"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Color
          </Text>
          <TouchableOpacity
            style={styles.colorPickerPreview}
            onPress={() => setShowColorPicker(true)}
          >
            <View
              style={[styles.colorSwatch, { backgroundColor: formData.color }]}
            />
            <Text style={styles.colorPickerButtonText}>Select Color</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.secondaryText}
            />
          </TouchableOpacity>
        </Animated.View>

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
              <Text style={styles.presetColorsHeading}>Preset Colors</Text>
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
                  style={[styles.button, { backgroundColor: formData.color }]}
                  onPress={() => setShowColorPicker(false)}
                >
                  <Text style={styles.submitButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Form Actions */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(600)}
          style={styles.buttonContainer}
        >
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: formData.color },
            ]}
            onPress={handleSubmit}
          >
            <MaterialCommunityIcons
              name={isEditing ? "check" : "plus"}
              size={20}
              color={theme.colors.contrastPrimary}
            />
            <Text style={styles.submitButtonText}>{submitButtonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: theme.fonts.titleMedium,
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors.secondaryText,
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    fontFamily: theme.fonts.regular,
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
    gap: 6,
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
    fontSize: 14,
  },
  radioTextSelected: {
    color: theme.colors.contrastPrimary,
  },
  monthlySelectionContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
  submitButtonText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.contrastPrimary,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  cancelButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorPickerModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  colorPickerTitle: {
    fontFamily: theme.fonts.titleSemibold,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: theme.colors.text,
  },
  colorPickerWrapper: {
    height: 300,
    marginBottom: 20,
  },
  presetColorsHeading: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.secondaryText,
    marginBottom: 10,
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
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorPickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },
  timePickerText: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    marginLeft: 8,
  },
  colorPickerPreview: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 24,
    marginRight: 8,
  },
  colorPickerButtonText: {
    fontFamily: theme.fonts.regular,
    flex: 1,
    fontSize: 16,
    color: theme.colors.secondaryText,
  },
});
