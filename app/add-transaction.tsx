import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTextGeneration, useImageAnalysis } from '@fastshot/ai';
import { Transaction, TransactionType, generateId } from '@/types';
import { saveTransaction, getTransactions, updateTransaction, deleteTransaction, getAllCategories } from '@/services/storage';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryIcons, CategoryColors, DefaultCategories } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;
  const { currencySymbol } = useCurrency();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<string[]>([...DefaultCategories]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);

  // AI Category Suggestion
  const { generateText, isLoading: aiCategoryLoading } = useTextGeneration({
    onSuccess: (response) => {
      if (response) {
        // Parse the AI response to get the category
        const cleanedResponse = response.trim().replace(/['"]/g, '');
        // Check if the suggested category exists in our list
        const matchedCategory = categories.find(
          cat => cat.toLowerCase() === cleanedResponse.toLowerCase()
        );
        if (matchedCategory) {
          setSuggestedCategory(matchedCategory);
        }
      }
    },
    onError: (error) => {
      console.log('AI suggestion error:', error);
    },
  });

  // AI Receipt Scanning
  const { analyzeImage, isLoading: aiReceiptLoading } = useImageAnalysis({
    onSuccess: (response) => {
      if (response) {
        parseReceiptData(response);
      }
    },
    onError: (error) => {
      console.log('Receipt scanning error:', error);
      Alert.alert('Scan Failed', 'Could not extract information from receipt. Please enter details manually.');
      setScanningReceipt(false);
    },
  });

  useEffect(() => {
    loadCategories();
    if (isEditing && params.id) {
      loadTransaction(params.id);
    }
  }, [isEditing, params.id]);

  // Debounced AI category suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note.length >= 3 && !category) {
        suggestCategory(note);
      } else {
        setSuggestedCategory(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [note]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const loadTransaction = async (id: string) => {
    try {
      const transactions = await getTransactions();
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setAmount(transaction.amount.toString());
        setType(transaction.type);
        setDate(new Date(transaction.date));
        setNote(transaction.note);
        setCategory(transaction.category);
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
    }
  };

  const suggestCategory = async (noteText: string) => {
    const categoryList = categories.join(', ');
    const prompt = `Based on this transaction note: "${noteText}", suggest the most appropriate category from this list: ${categoryList}. Reply with ONLY the category name, nothing else.`;

    try {
      await generateText(prompt);
    } catch (error) {
      console.log('AI suggestion failed:', error);
    }
  };

  const parseReceiptData = (aiResponse: string) => {
    try {
      // Extract amount (look for currency symbols and numbers)
      const amountMatch = aiResponse.match(/(?:total|amount|price|sum)[:\s]*[\$€£¥₹]?\s*(\d+\.?\d*)/i);
      if (amountMatch && amountMatch[1]) {
        setAmount(amountMatch[1]);
      }

      // Extract merchant/vendor name (usually at the beginning or mentioned explicitly)
      const merchantMatch = aiResponse.match(/(?:merchant|store|vendor|from)[:\s]*([A-Za-z0-9\s&'-]+)/i);
      if (merchantMatch && merchantMatch[1]) {
        setNote(merchantMatch[1].trim());
      }

      // Extract date
      const dateMatch = aiResponse.match(/(?:date|on)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
      if (dateMatch && dateMatch[1]) {
        try {
          const parsedDate = new Date(dateMatch[1]);
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate);
          }
        } catch (e) {
          console.log('Could not parse date:', e);
        }
      }

      setScanningReceipt(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Receipt Scanned!',
        'Information extracted successfully. Please review and adjust if needed.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Error parsing receipt data:', error);
      setScanningReceipt(false);
      Alert.alert('Parsing Error', 'Could not parse receipt data. Please enter details manually.');
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access is required to scan receipts.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library access is required to select receipts.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
        scanReceipt(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Could not open camera');
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
        scanReceipt(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Could not open photo library');
    }
  };

  const scanReceipt = async (imageUri: string) => {
    setScanningReceipt(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const prompt = `Analyze this receipt image and extract the following information:
1. Merchant/Store name
2. Total amount (numeric value only)
3. Date (in MM/DD/YYYY format)

Format your response like this:
Merchant: [name]
Amount: [number]
Date: [date]`;

    try {
      await analyzeImage({
        imageUrl: imageUri,
        prompt: prompt,
      });
    } catch (error) {
      console.log('Receipt scan error:', error);
      setScanningReceipt(false);
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    }
  };

  const showReceiptOptions = () => {
    Alert.alert(
      'Scan Receipt',
      'Choose how to add your receipt',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
      setSuggestedCategory(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSaving(true);
    try {
      const transaction: Transaction = {
        id: isEditing && params.id ? params.id : generateId(),
        amount: parseFloat(amount),
        type,
        category,
        note: note.trim(),
        date: date.toISOString(),
        createdAt: isEditing ? date.toISOString() : new Date().toISOString(),
      };

      if (isEditing) {
        await updateTransaction(transaction);
      } else {
        await saveTransaction(transaction);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (params.id) {
                await deleteTransaction(params.id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.back();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatAmount = (text: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const expenseCategories = categories.filter(c => !['Income', 'Salary', 'Investment', 'Gift'].includes(c));
  const incomeCategories = ['Income', 'Salary', 'Investment', 'Gift', 'Others'];
  const displayCategories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.emeraldGreen} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI Receipt Scanner */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.receiptScannerCard}
              onPress={showReceiptOptions}
              disabled={scanningReceipt}
              activeOpacity={0.7}
            >
              <View style={styles.scannerIcon}>
                {scanningReceipt ? (
                  <ActivityIndicator size="small" color={Colors.emeraldGreen} />
                ) : (
                  <Ionicons name="camera" size={24} color={Colors.emeraldGreen} />
                )}
              </View>
              <View style={styles.scannerContent}>
                <View style={styles.scannerHeader}>
                  <Ionicons name="sparkles" size={16} color={Colors.warning} />
                  <Text style={styles.scannerTitle}>AI Receipt Scanner</Text>
                </View>
                <Text style={styles.scannerSubtitle}>
                  {scanningReceipt
                    ? 'Analyzing receipt...'
                    : 'Scan a receipt to auto-fill transaction details'}
                </Text>
              </View>
              {receiptImage && !scanningReceipt && (
                <Image source={{ uri: receiptImage }} style={styles.receiptThumbnail} />
              )}
            </TouchableOpacity>
          )}

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                editable={!scanningReceipt}
              />
            </View>
          </View>

          {/* Type Toggle */}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setType('income');
                  setCategory('');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'income' && styles.typeButtonTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setType('expense');
                  setCategory('');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'expense' && styles.typeButtonTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Lunch at Chipotle"
              placeholderTextColor={Colors.textMuted}
              multiline={false}
            />
          </View>

          {/* AI Category Suggestion */}
          {(aiCategoryLoading || suggestedCategory) && (
            <View style={styles.aiSuggestionCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={18} color={Colors.emeraldGreen} />
                <Text style={styles.aiTitle}>Newell AI Smart Categorization</Text>
              </View>
              {aiCategoryLoading ? (
                <View style={styles.aiLoading}>
                  <ActivityIndicator size="small" color={Colors.emeraldGreen} />
                  <Text style={styles.aiLoadingText}>Analyzing...</Text>
                </View>
              ) : suggestedCategory ? (
                <View style={styles.aiSuggestion}>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionLabel}>Suggested:</Text>
                    <View style={styles.suggestionBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.income} />
                      <Text style={styles.suggestionText}>{suggestedCategory}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applySuggestedCategory}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              {category ? (
                <View style={styles.selectedCategory}>
                  <View style={[styles.categoryIcon, { backgroundColor: (CategoryColors[category] || Colors.slateGrey) + '15' }]}>
                    <Ionicons
                      name={(CategoryIcons[category] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={CategoryColors[category] || Colors.slateGrey}
                    />
                  </View>
                  <Text style={styles.selectedCategoryText}>{category}</Text>
                </View>
              ) : (
                <Text style={styles.categoryPlaceholder}>Select a category</Text>
              )}
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.categoryGrid}>
                {displayCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryItem,
                      category === cat && styles.categoryItemActive,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                      setSuggestedCategory(null);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={[styles.categoryItemIcon, { backgroundColor: (CategoryColors[cat] || Colors.slateGrey) + '15' }]}>
                      <Ionicons
                        name={(CategoryIcons[cat] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={CategoryColors[cat] || Colors.slateGrey}
                      />
                    </View>
                    <Text style={styles.categoryItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Delete Button (only when editing) */}
          {isEditing && (
            <View style={styles.deleteSection}>
              <Button
                title="Delete Transaction"
                variant="ghost"
                onPress={handleDelete}
                textStyle={{ color: Colors.expense }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.emeraldGreen,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  receiptScannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mintGreen + '30',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.emeraldGreen + '30',
    borderStyle: 'dashed',
    ...Shadows.sm,
  },
  scannerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scannerContent: {
    flex: 1,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  scannerTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.deepForestGreen,
  },
  scannerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
  },
  receiptThumbnail: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  currencySymbol: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  typeButtonActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  typeButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  typeButtonTextActive: {
    color: Colors.textPrimary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  dateText: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    ...Shadows.sm,
  },
  aiSuggestionCard: {
    backgroundColor: Colors.mintGreen + '30',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.emeraldGreen + '30',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  aiTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.deepForestGreen,
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiLoadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  suggestionLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  suggestionText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  applyButton: {
    backgroundColor: Colors.emeraldGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  applyButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  selectedCategoryText: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  categoryPlaceholder: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  categoryItemActive: {
    borderColor: Colors.emeraldGreen,
    backgroundColor: Colors.mintGreen + '30',
  },
  categoryItemIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  categoryItemText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
  },
  deleteSection: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
});
