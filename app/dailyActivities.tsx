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
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

// Custom Dropdown Component
interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !selectedOption && styles.placeholder,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    option.value === value && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setIsVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  const loadDailyActivities = React.useCallback(async (
    page: number = 1,
    reset: boolean = false
  ) => {
    console.log('loadDailyActivities called', { page, reset });
    
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
        ...(selectedSubActivityId && { subActivityId: selectedSubActivityId }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      };

      const result = await fetchDailyActivities(params);

      if (result) {
        console.log('API Response:', { 
          dataCount: result.data.length, 
          pagination: result.pagination,
          isReset: reset || page === 1
        });
        
        if (reset || page === 1) {
          setDailyActivities(result.data);
          currentDataLengthRef.current = result.data.length;
          console.log('Data reset, new count:', result.data.length);
        } else {
          // Save current state before updating data
          const currentScrollPosition = scrollPositionRef.current;
          const targetIndex = lastVisibleIndexRef.current;

          
          // Filter out duplicates based on ID to prevent duplicate keys
          setDailyActivities((prev) => {
            const existingIds = new Set(prev.map(item => item.id));
            const newData = result.data.filter(item => !existingIds.has(item.id));
            const newTotal = [...prev, ...newData];
            
            console.log('Appending data:', { 
              prevCount: prev.length, 
              newDataCount: newData.length, 
              totalAfter: newTotal.length,
              targetIndex,
              scrollPosition: currentScrollPosition
            });
            
            // Update the current data length
            currentDataLengthRef.current = newTotal.length;
            
            // Restore scroll position after data is updated
            requestAnimationFrame(() => {
              requestAnimationFrame(() => { // Double RAF for better timing
                if (flashListRef.current) {
                  // Try to scroll to the item that was last visible
                  if (targetIndex >= 0 && targetIndex < newTotal.length) {
                    const scrollToIndex = Math.max(0, targetIndex - 1);
                    console.log('Restoring scroll to index:', scrollToIndex, 'total items:', newTotal.length);
                    try {
                      flashListRef.current.scrollToIndex({ 
                        index: scrollToIndex,
                        animated: false,
                        viewPosition: 0.1 // Show item very close to top
                      });
                    } catch {
                      console.log('ScrollToIndex failed, using calculated offset');
                      // Calculate offset based on item index and estimated height
                      const estimatedItemHeight = 200; // Adjust based on your actual item height
                      const calculatedOffset = scrollToIndex * estimatedItemHeight;
                      flashListRef.current.scrollToOffset({ 
                        offset: calculatedOffset,
                        animated: false 
                      });
                    }
                  } else if (currentScrollPosition > 100) {
                    console.log('Using offset fallback:', currentScrollPosition);
                    flashListRef.current.scrollToOffset({ 
                      offset: currentScrollPosition,
                      animated: false 
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
  }, [selectedProjectId, selectedActivityId, selectedSubActivityId, searchQuery, fetchDailyActivities]);

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
    console.log('Load more triggered', { 
      hasNextPage: pagination && pagination.page < pagination.totalPages, 
      isLoadingMore,
      currentPage: pagination?.page,
      totalPages: pagination?.totalPages 
    });
    
    if (pagination && pagination.page < pagination.totalPages && !isLoadingMore) {
      const nextPage = pagination.page + 1;
      console.log('Loading next page:', nextPage);
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
  const renderDailyActivityItem = React.useCallback(({ item }: { item: DailySubActivity }) => (
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
  ), []);

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
        console.log('Viewable items changed:', { 
          first: firstVisibleItem.index, 
          last: newLastIndex,
          count: viewableItems.length 
        });
      }
      
      lastVisibleIndexRef.current = newLastIndex;
    }
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Filters */}
      <View style={styles.compactFiltersContainer}>
        {/* Add Report Button */}
        <TouchableOpacity
          style={styles.compactAddButton}
          onPress={() => router.push("/createTask")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.compactAddButtonText}>Tambah Laporan</Text>
        </TouchableOpacity>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sub activities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Project Filter */}
        <CustomDropdown
          label="Project"
          value={selectedProjectId}
          options={[
            { label: "All Projects", value: "" },
            ...projects.map((project) => ({
              label: project.pekerjaan,
              value: project.id,
            })),
          ]}
          onSelect={handleProjectChange}
          placeholder="Select Project"
        />

        {/* Activity Filter */}
        {activities.length > 0 && (
          <CustomDropdown
            label="Activity"
            value={selectedActivityId}
            options={[
              { label: "All Activities", value: "" },
              ...activities.map((activity) => ({
                label: activity.name,
                value: activity.id,
              })),
            ]}
            onSelect={handleActivityChange}
            placeholder="Select Activity"
          />
        )}

        {/* Sub Activity Filter */}
        {subActivities.length > 0 && (
          <CustomDropdown
            label="Sub Activity"
            value={selectedSubActivityId}
            options={[
              { label: "All Sub Activities", value: "" },
              ...subActivities.map((subActivity) => ({
                label: subActivity.name,
                value: subActivity.id,
              })),
            ]}
            onSelect={handleSubActivityChange}
            placeholder="Select Sub Activity"
          />
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
          keyExtractor={(item, index) => `daily-activity-${item.id}-${item.tanggalProgres}-${index}`}
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
            minimumViewTime: 100
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  compactFiltersContainer: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  compactAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  compactAddButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 36,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: "60%",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#666",
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
