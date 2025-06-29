import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Event, EventFilter, Category } from "../types";
import { theme } from "../constants/theme";
import { apiService } from "../services/api";
import EventCard from "../components/EventCard";
import { useLanguage } from "../contexts/LanguageContext";

interface ExploreScreenProps {
  onEventPress: (event: Event) => void;
}

export default function ExploreScreen({ onEventPress }: ExploreScreenProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilter>({});
  const { t } = useLanguage();

  useEffect(() => {
    loadData();

    // Debug warning for Text node issues
    console.warn("Checking for text node issues in ExploreScreen");
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchQuery, filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load real data from API
      const [eventsData, categoriesData] = await Promise.all([
        apiService.getEvents(),
        apiService.getCategories(),
      ]);

      if (eventsData && Array.isArray(eventsData)) {
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      }

      if (categoriesData && Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error loading explore data:", error);
      // Reset arrays to empty if the API fails
      setEvents([]);
      setCategories([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...events];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.tags &&
            event.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (event) => event.categoryId === filters.category
      );
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((event) => event.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((event) => event.price <= filters.maxPrice!);
    }

    // Date filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(
        (event) => new Date(event.startTime) >= startDate
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter((event) => new Date(event.endTime) <= endDate);
    }

    // City filter
    if (filters.city && filtered.length > 0 && filtered[0].location) {
      filtered = filtered.filter(
        (event) =>
          event.location &&
          event.location.city &&
          event.location.city
            .toLowerCase()
            .includes(filters.city!.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCloseText}>Đóng</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.modalClearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Danh mục</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    filters.category === category.id &&
                      styles.categoryItemSelected,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      category:
                        filters.category === category.id
                          ? undefined
                          : category.id,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      filters.category === category.id &&
                        styles.categoryItemTextSelected,
                    ]}
                  >
                    {`${category.icon} ${category.name}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Khoảng giá</Text>
            <View style={styles.priceInputRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Từ (đ)"
                value={filters.minPrice?.toString() || ""}
                onChangeText={(text) =>
                  setFilters({
                    ...filters,
                    minPrice: text ? parseFloat(text) : undefined,
                  })
                }
                keyboardType="numeric"
              />
              <Text style={styles.priceInputSeparator}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Đến (đ)"
                value={filters.maxPrice?.toString() || ""}
                onChangeText={(text) =>
                  setFilters({
                    ...filters,
                    maxPrice: text ? parseFloat(text) : undefined,
                  })
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* City Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Thành phố</Text>
            <TextInput
              style={styles.cityInput}
              placeholder="Nhập thành phố"
              value={filters.city || ""}
              onChangeText={(text) =>
                setFilters({ ...filters, city: text || undefined })
              }
            />
          </View>

          {/* Apply Filters Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sự kiện..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPill,
              filters.category === category.id && styles.categoryPillSelected,
            ]}
            onPress={() =>
              setFilters({
                ...filters,
                category:
                  filters.category === category.id ? undefined : category.id,
              })
            }
          >
            <Text
              style={[
                styles.categoryPillText,
                filters.category === category.id &&
                  styles.categoryPillTextSelected,
              ]}
            >
              {`${category.icon} ${category.name}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Event List */}
      {filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={onEventPress}
              style={styles.eventCard}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Không tìm thấy sự kiện</Text>
          <Text style={styles.emptyStateText}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={clearFilters}>
            <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.base,
  },
  filterButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  categoryPillSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  categoryPillTextSelected: {
    color: theme.colors.white,
  },
  eventList: {
    padding: theme.spacing.md,
  },
  eventCard: {
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  resetButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalCloseText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  modalClearText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
  },
  modalContent: {
    padding: theme.spacing.md,
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  filterSectionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  categoryItemTextSelected: {
    color: theme.colors.white,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.base,
  },
  priceInputSeparator: {
    color: theme.colors.text,
  },
  cityInput: {
    height: 44,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.base,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
    fontSize: theme.fontSize.base,
  },
});
