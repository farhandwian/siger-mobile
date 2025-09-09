import {
  DailySubActivity,
  Pagination,
  useDailySubActivities,
} from "@/hooks/useDailySubActivities";
import {
  Activity,
  Project,
  SubActivity,
  useProjects,
} from "@/hooks/useProjects";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Custom Dropdown Component (matching createTask design)
const CustomDropdown = ({
  items,
  value,
  onSelect,
  placeholder,
  style = {},
  searchable = false,
  disabled = false,
}: {
  items: any[];
  value: any;
  onSelect: (value: any) => void;
  placeholder: string;
  style?: any;
  searchable?: boolean;
  disabled?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredItems = searchable
    ? items.filter((item: any) => {
        const searchLower = searchText.toLowerCase().trim();
        const labelLower = item.label.toLowerCase();
        // Search dalam label dengan multiple kata
        return (
          searchLower === "" ||
          labelLower.includes(searchLower) ||
          labelLower
            .split(" ")
            .some((word: string) => word.startsWith(searchLower))
        );
      })
    : items;

  const selectedItem = items.find((item: any) => item.value === value);

  const handleSelect = (item: any) => {
    onSelect(item.value);
    setIsVisible(false);
    setSearchText(""); // Reset search when closing
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchText(""); // Reset search when closing
  };

  // Function to highlight searched text
  const renderHighlightedText = (
    text: string,
    searchTerm: string,
    itemValue: any
  ) => {
    const isSelected = itemValue === value;

    if (!searchable || !searchTerm.trim()) {
      return (
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
          numberOfLines={0}
        >
          {text}
        </Text>
      );
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <Text
        style={[styles.optionText, isSelected && styles.selectedOptionText]}
        numberOfLines={0}
      >
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.customDropdown,
          style,
          disabled && styles.disabledDropdown,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[styles.customDropdownText, disabled && styles.disabledText]}
          numberOfLines={2}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text
          style={[styles.customDropdownArrow, disabled && styles.disabledText]}
        >
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={handleClose}>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>{placeholder}</Text>

            {searchable && (
              <View>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Ketik untuk mencari..."
                  value={searchText}
                  onChangeText={setSearchText}
                  autoFocus={true}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                />
                {searchText.length > 0 && (
                  <Text style={styles.searchResultText}>
                    Ditemukan {filteredItems.length} hasil
                  </Text>
                )}
              </View>
            )}

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              ListEmptyComponent={
                searchable && searchText.length > 0 ? (
                  <View style={styles.emptySearchContainer}>
                    <Text style={styles.emptySearchText}>
                      Tidak ada hasil untuk &quot;{searchText}&quot;
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  {renderHighlightedText(item.label, searchText, item.value)}
                  {item.value === value && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const DailyActivitiesScreen = () => {
  // Hooks
  const { fetchDailyActivities, isLoading: isDailyActivitiesLoading } =
    useDailySubActivities();
  const { fetchProjects } = useProjects();

  // State
  const [dailyActivities, setDailyActivities] = useState<DailySubActivity[]>(
    []
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subActivities, setSubActivities] = useState<SubActivity[]>([]);

  // Filter states
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedSubActivityId, setSelectedSubActivityId] =
    useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref for FlashList and scroll position
  const flashListRef = useRef<any>(null);
  const scrollPositionRef = useRef(0);
  const lastVisibleIndexRef = useRef(0);
  const currentDataLengthRef = useRef(0);

  // Load projects using hook
  const loadProjects = React.useCallback(async () => {
    try {
      const result = await fetchProjects();
      if (result) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      Alert.alert("Error", "Failed to load projects");
    }
  }, [fetchProjects]);

  // Load daily activities using hook
  const loadDailyActivities = React.useCallback(
    async (page: number = 1, reset: boolean = false) => {
      console.log("loadDailyActivities called", { page, reset });

      if (page === 1 && !reset) {
        // Initial loading handled by hook
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = {
          page,
          limit: 20,
          sortBy: "updatedAt" as const,
          sortOrder: "desc" as const,
          ...(selectedProjectId && { projectId: selectedProjectId }),
          ...(selectedActivityId && { activityId: selectedActivityId }),
          ...(selectedSubActivityId && {
            subActivityId: selectedSubActivityId,
          }),
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
        };

        const result = await fetchDailyActivities(params);

        if (result) {
          console.log("API Response:", {
            dataCount: result.data.length,
            pagination: result.pagination,
            isReset: reset || page === 1,
          });

          if (reset || page === 1) {
            setDailyActivities(result.data);
            currentDataLengthRef.current = result.data.length;
            console.log("Data reset, new count:", result.data.length);
          } else {
            // Save current state before updating data
            const currentScrollPosition = scrollPositionRef.current;
            const targetIndex = lastVisibleIndexRef.current;

            // Filter out duplicates based on ID to prevent duplicate keys
            setDailyActivities((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const newData = result.data.filter(
                (item) => !existingIds.has(item.id)
              );
              const newTotal = [...prev, ...newData];

              console.log("Appending data:", {
                prevCount: prev.length,
                newDataCount: newData.length,
                totalAfter: newTotal.length,
                targetIndex,
                scrollPosition: currentScrollPosition,
              });

              // Update the current data length
              currentDataLengthRef.current = newTotal.length;

              // Restore scroll position after data is updated
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // Double RAF for better timing
                  if (flashListRef.current) {
                    // Try to scroll to the item that was last visible
                    if (targetIndex >= 0 && targetIndex < newTotal.length) {
                      const scrollToIndex = Math.max(0, targetIndex - 1);
                      console.log(
                        "Restoring scroll to index:",
                        scrollToIndex,
                        "total items:",
                        newTotal.length
                      );
                      try {
                        flashListRef.current.scrollToIndex({
                          index: scrollToIndex,
                          animated: false,
                          viewPosition: 0.1, // Show item very close to top
                        });
                      } catch {
                        console.log(
                          "ScrollToIndex failed, using calculated offset"
                        );
                        // Calculate offset based on item index and estimated height
                        const estimatedItemHeight = 200; // Adjust based on your actual item height
                        const calculatedOffset =
                          scrollToIndex * estimatedItemHeight;
                        flashListRef.current.scrollToOffset({
                          offset: calculatedOffset,
                          animated: false,
                        });
                      }
                    } else if (currentScrollPosition > 100) {
                      console.log(
                        "Using offset fallback:",
                        currentScrollPosition
                      );
                      flashListRef.current.scrollToOffset({
                        offset: currentScrollPosition,
                        animated: false,
                      });
                    }
                  }
                });
              });

              return newTotal;
            });
          }
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error("Error loading daily activities:", error);
        Alert.alert("Error", "Failed to load daily activities");
      } finally {
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [
      selectedProjectId,
      selectedActivityId,
      selectedSubActivityId,
      searchQuery,
      fetchDailyActivities,
    ]
  );

  // Handle project selection
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedActivityId("");
    setSelectedSubActivityId("");

    if (projectId) {
      const project = projects.find((p) => p.id === projectId);
      setActivities(project?.activities || []);
    } else {
      setActivities([]);
    }
    setSubActivities([]);
  };

  // Handle activity selection
  const handleActivityChange = (activityId: string) => {
    setSelectedActivityId(activityId);
    setSelectedSubActivityId("");

    if (activityId) {
      const activity = activities.find((a) => a.id === activityId);
      setSubActivities(activity?.subActivities || []);
    } else {
      setSubActivities([]);
    }
  };

  // Handle sub activity selection
  const handleSubActivityChange = (subActivityId: string) => {
    setSelectedSubActivityId(subActivityId);
  };

  // Apply filters
  const applyFilters = () => {
    loadDailyActivities(1, true);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedProjectId("");
    setSelectedActivityId("");
    setSelectedSubActivityId("");
    setSearchQuery("");
    setActivities([]);
    setSubActivities([]);
    loadDailyActivities(1, true);
  };

  // Load more data for infinite scroll
  const loadMore = React.useCallback(() => {
    console.log("Load more triggered", {
      hasNextPage: pagination && pagination.page < pagination.totalPages,
      isLoadingMore,
      currentPage: pagination?.page,
      totalPages: pagination?.totalPages,
    });

    if (
      pagination &&
      pagination.page < pagination.totalPages &&
      !isLoadingMore
    ) {
      const nextPage = pagination.page + 1;
      console.log("Loading next page:", nextPage);
      loadDailyActivities(nextPage, false);
    }
  }, [pagination, isLoadingMore, loadDailyActivities]);

  // Refresh data
  const onRefresh = () => {
    setIsRefreshing(true);
    loadDailyActivities(1, true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render daily activity item
  const renderDailyActivityItem = React.useCallback(
    ({ item }: { item: DailySubActivity }) => (
      <View style={styles.activityCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.projectName}>
            {item.subActivity.activity.project.pekerjaan}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.tanggalProgres)}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.activityName}>
            {item.subActivity.activity.name}
          </Text>
          <Text style={styles.subActivityName}>{item.subActivity.name}</Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <Text style={styles.progressValue}>
              {item.progresRealisasiPerHari}%
            </Text>
          </View>

          {item.catatanKegiatan && (
            <Text style={styles.notes}>{item.catatanKegiatan}</Text>
          )}

          {item.file && item.file.length > 0 && (
            <View style={styles.fileContainer}>
              <Ionicons name="document-attach" size={16} color="#666" />
              <Text style={styles.fileText}>{item.file.length} file(s)</Text>
            </View>
          )}

          <View style={styles.userContainer}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.userName}>{item.user.name}</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  useEffect(() => {
    loadProjects();
    loadDailyActivities();
  }, [loadProjects, loadDailyActivities]);

  // Handle viewable items changed to track last visible item
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const lastVisibleItem = viewableItems[viewableItems.length - 1];
      const firstVisibleItem = viewableItems[0];
      const newLastIndex = lastVisibleItem.index;

      // Only log if there's significant change to reduce spam
      if (Math.abs(newLastIndex - lastVisibleIndexRef.current) > 2) {
        console.log("Viewable items changed:", {
          first: firstVisibleItem.index,
          last: newLastIndex,
          count: viewableItems.length,
        });
      }

      lastVisibleIndexRef.current = newLastIndex;
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Topbar - matching createTask design */}
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>dailyActivities</Text>
        <View style={styles.backButton} />
      </View>

      {/* Add Report Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addReportButton}
          onPress={() => router.push("/createTask")}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addReportButtonText}>Tambah Laporan</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sub activities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters Card */}
      <View style={styles.filtersCard}>
        {/* Project Filter */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project</Text>
          <CustomDropdown
            items={[
              { label: "All Projects", value: "" },
              ...projects.map((project) => ({
                label: project.pekerjaan,
                value: project.id,
              })),
            ]}
            value={selectedProjectId}
            onSelect={handleProjectChange}
            placeholder="Pilih Project"
            searchable={true}
          />
        </View>

        {/* Activity Filter - Only show if project is selected */}
        {selectedProjectId && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Activity</Text>
            <CustomDropdown
              items={[
                { label: "All Activities", value: "" },
                ...activities.map((activity) => ({
                  label: activity.name,
                  value: activity.id,
                })),
              ]}
              value={selectedActivityId}
              onSelect={handleActivityChange}
              placeholder="Pilih Activity"
              searchable={true}
            />
          </View>
        )}

        {/* Sub Activity Filter - Only show if activity is selected */}
        {selectedActivityId && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Sub Activity</Text>
            <CustomDropdown
              items={[
                { label: "All Sub Activities", value: "" },
                ...subActivities.map((subActivity) => ({
                  label: subActivity.name,
                  value: subActivity.id,
                })),
              ]}
              value={selectedSubActivityId}
              onSelect={handleSubActivityChange}
              placeholder="Pilih Sub Activity"
              searchable={true}
            />
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Activities List */}
      {isDailyActivitiesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading daily activities...</Text>
        </View>
      ) : (
        <FlashList
          ref={flashListRef}
          data={dailyActivities}
          renderItem={renderDailyActivityItem}
          keyExtractor={(item, index) =>
            `daily-activity-${item.id}-${item.tanggalProgres}-${index}`
          }
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          onScroll={(event) => {
            scrollPositionRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 30,
            minimumViewTime: 100,
          }}
          ListFooterComponent={renderFooter}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No daily activities found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 0,
  },
  topbar: {
    backgroundColor: "#1a365d",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    elevation: 4,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  topbarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  addReportButton: {
    backgroundColor: "#ffc928",
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    boxShadow: "0px 2px 4px rgba(255, 201, 40, 0.15)",
  },
  addButtonIcon: {
    color: "#1a365d",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  addReportButtonText: {
    color: "#1a365d",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#101828",
  },
  filtersCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 16,
    padding: 20,
    elevation: 3,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 18,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    color: "#101828",
    marginBottom: 4,
    fontWeight: "600",
  },
  // Custom Dropdown Styles (matching createTask)
  customDropdown: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  disabledDropdown: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  customDropdownText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    paddingRight: 8,
  },
  disabledText: {
    color: "#9ca3af",
  },
  customDropdownArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#101828",
    marginBottom: 15,
    textAlign: "center",
  },
  modalSearchInput: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
  },
  searchResultText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySearchContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptySearchText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  highlightedText: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontWeight: "bold",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#f0f9ff",
  },
  optionText: {
    fontSize: 14,
    color: "#101828",
    flex: 1,
    lineHeight: 20,
  },
  selectedOptionText: {
    color: "#1d4ed8",
    fontWeight: "500",
  },
  checkMark: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#1a365d",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#1a365d",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  cardContent: {
    gap: 8,
  },
  activityName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  subActivityName: {
    fontSize: 14,
    color: "#777",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  notes: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fileText: {
    fontSize: 12,
    color: "#666",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  userName: {
    fontSize: 12,
    color: "#666",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});

export default DailyActivitiesScreen;
