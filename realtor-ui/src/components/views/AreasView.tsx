import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Input, ScrollView } from 'tamagui';
import { Home, Search } from '@tamagui/lucide-icons';
import { Point, SavedArea, PropertyListing } from '../../services/map/MapProviderInterface';
import { MapServiceFactory } from '../../services/map/MapServiceFactory';

export interface AreasViewProps {
  unit?: 'kilometers' | 'miles';
  radius?: number;
  savedAreas?: SavedArea[];
  selectedAreaId?: string | null;
  onSelectArea?: (id: string | null) => void;
  onSaveArea?: (area: { name: string; polygon: Point[] }) => Promise<void> | void;
  onDeleteArea?: (id: string) => Promise<void> | void;
  onExecuteSearch?: (areaId: string) => Promise<SavedArea | void> | void;
  onTransferProperty?: (areaId: string, zpid: string) => Promise<SavedArea | void> | void;
}

export function getUniqueAreaName(baseName: string, existingAreas: SavedArea[]): string {
  const trimmed = baseName.trim() || 'Untitled';
  const existingNames = new Set(existingAreas.map((a) => a.name.trim().toLowerCase()));

  if (!existingNames.has(trimmed.toLowerCase())) {
    return trimmed;
  }

  let counter = 1;
  while (existingNames.has(`${trimmed} ${counter}`.toLowerCase())) {
    counter++;
  }
  return `${trimmed} ${counter}`;
}

export const AreasView: React.FC<AreasViewProps> = ({
  unit = 'kilometers',
  radius = 50,
  savedAreas = [],
  selectedAreaId = null,
  onSelectArea,
  onSaveArea,
  onDeleteArea,
  onExecuteSearch,
  onTransferProperty,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [userLocation, setUserLocation] = useState<Point>({ lat: 43.6532, lng: -79.3832 });
  const [areasList, setAreasList] = useState<SavedArea[]>(savedAreas);
  const [isSearching, setIsSearching] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);

  // Modal State for Area Naming
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [modalAreaName, setModalAreaName] = useState('');
  const [pendingPolygon, setPendingPolygon] = useState<Point[]>([]);

  useEffect(() => {
    if (savedAreas && JSON.stringify(savedAreas) !== JSON.stringify(areasList)) {
      setAreasList(savedAreas);
    }
  }, [savedAreas]);

  // Geolocation detection with fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 3000 }
      );
    }
  }, []);

  // Calculate zoom level from radius & unit
  const radiusKm = unit === 'miles' ? radius * 1.60934 : radius;
  const zoomLevel = Math.max(4, Math.min(18, Math.round(14 - Math.log2(Math.max(1, radiusKm) / 5))));

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
  };

  const handleFinishDrawing = () => {
    if (currentPolygon.length >= 3) {
      const defaultName = getUniqueAreaName('Untitled', areasList);
      setModalAreaName(defaultName);
      setPendingPolygon([...currentPolygon]);
      setIsNameModalOpen(true);
    } else {
      setIsDrawing(false);
      setCurrentPolygon([]);
    }
  };

  const handleSaveModal = async () => {
    const finalName = getUniqueAreaName(modalAreaName, areasList);
    const newArea = {
      id: `area-${Date.now()}`,
      name: finalName,
      polygon: pendingPolygon,
      properties: [],
      preCandidateProperties: [],
    };

    if (onSaveArea) {
      await onSaveArea({ name: newArea.name, polygon: newArea.polygon });
    }

    setAreasList((prev) => [...prev, newArea]);
    setIsNameModalOpen(false);
    setIsDrawing(false);
    setCurrentPolygon([]);
    setPendingPolygon([]);
  };

  const handleCancelModal = () => {
    setIsNameModalOpen(false);
    setIsDrawing(false);
    setCurrentPolygon([]);
    setPendingPolygon([]);
  };

  const handleAddPoint = (pt: Point) => {
    setCurrentPolygon((prev) => [...prev, pt]);
  };

  const handleUndoPoint = () => {
    setCurrentPolygon((prev) => prev.slice(0, -1));
  };

  const handleDeleteSelectedArea = async () => {
    if (selectedAreaId) {
      if (onDeleteArea) {
        await onDeleteArea(selectedAreaId);
      }
      setAreasList((prev) => prev.filter((a) => a.id !== selectedAreaId));
      if (onSelectArea) {
        onSelectArea(null);
      }
    }
  };

  const handleExecuteAreaSearch = async () => {
    if (!selectedAreaId) return;
    setIsSearching(true);
    try {
      if (onExecuteSearch) {
        const updatedArea = await onExecuteSearch(selectedAreaId);
        if (updatedArea) {
          setAreasList((prev) =>
            prev.map((a) => (a.id === selectedAreaId ? updatedArea : a))
          );
        }
      } else {
        // Fallback local search execution if onExecuteSearch prop was omitted
        await new Promise((res) => setTimeout(res, 400));
        const target = areasList.find((a) => a.id === selectedAreaId);
        const polyCenter = target?.polygon?.[0] || { lat: 43.6492, lng: -79.3838 };

        const sampleListings: PropertyListing[] = [
          {
            zpid: `prop-search-${Date.now()}-1`,
            price: 850000,
            currency: 'CAD',
            address: { streetAddress: '290 Bremner Blvd Unit 1402', city: 'Toronto', state: 'ON', zipcode: 'M5V 3L9', country: 'CA' },
            location: { latitude: polyCenter.lat, longitude: polyCenter.lng },
            bedrooms: 2,
            bathrooms: 2,
            livingArea: 880,
            homeType: 'CONDO',
            homeStatus: 'FOR_SALE',
          },
          {
            zpid: `prop-search-${Date.now()}-2`,
            price: 1250000,
            currency: 'CAD',
            address: { streetAddress: '88 Harbour St Unit 2204', city: 'Toronto', state: 'ON', zipcode: 'M5J 0B7', country: 'CA' },
            location: { latitude: polyCenter.lat + 0.003, longitude: polyCenter.lng + 0.003 },
            bedrooms: 3,
            bathrooms: 2.5,
            livingArea: 1240,
            homeType: 'CONDO',
            homeStatus: 'FOR_SALE',
          },
          {
            zpid: `prop-search-${Date.now()}-3`,
            price: 699000,
            currency: 'CAD',
            address: { streetAddress: '55 Mercer St Unit 809', city: 'Toronto', state: 'ON', zipcode: 'M5V 0H3', country: 'CA' },
            location: { latitude: polyCenter.lat - 0.003, longitude: polyCenter.lng - 0.003 },
            bedrooms: 1,
            bathrooms: 1,
            livingArea: 590,
            homeType: 'CONDO',
            homeStatus: 'FOR_SALE',
          },
        ];

        setAreasList((prev) =>
          prev.map((a) =>
            a.id === selectedAreaId ? { ...a, properties: sampleListings } : a
          )
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleTransferProperty = async (property: PropertyListing, areaId: string) => {
    if (onTransferProperty) {
      const updatedArea = await onTransferProperty(areaId, property.zpid);
      if (updatedArea) {
        setAreasList((prev) =>
          prev.map((a) => (a.id === areaId ? updatedArea : a))
        );
      }
    } else {
      // Fallback local transfer if onTransferProperty prop was omitted
      setAreasList((prev) =>
        prev.map((a) => {
          if (a.id !== areaId) return a;
          const currentProps = a.properties || [];
          const currentCandidates = a.candidateProperties || a.preCandidateProperties || [];
          const remainingProps = currentProps.filter((p) => p.zpid !== property.zpid);
          return {
            ...a,
            properties: remainingProps,
            candidateProperties: [...currentCandidates, property],
          };
        })
      );
    }
  };

  const selectedArea = selectedAreaId ? areasList.find((a) => a.id === selectedAreaId) : null;
  const displayedAreas = selectedArea ? [selectedArea] : areasList;

  const searchPropsCount = selectedArea?.properties?.length || 0;
  const candidatePropsList = selectedArea?.candidateProperties || selectedArea?.preCandidateProperties || [];
  const candidatePropsCount = candidatePropsList.length;

  return (
    <YStack testID="areas-view-container" gap="$4" width="100%" flex={1} minHeight={600} position="relative">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Text fontSize={24} fontWeight="800" color="#0f172a">
            {selectedArea ? `Area: ${selectedArea.name}` : 'Property Search Areas'}
          </Text>
          <Text fontSize={14} color="#64748b">
            {selectedArea
              ? 'Execute RapidAPI property search inside target polygon or manage candidate listings.'
              : 'Select, draw, and manage target property search regions on Google Maps.'}
          </Text>
        </YStack>

        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          {selectedArea && (
            <Button
              testID="execute-search-button"
              backgroundColor="#059669"
              hoverStyle={{ backgroundColor: '#047857' }}
              onPress={handleExecuteAreaSearch}
              borderRadius="$4"
              paddingHorizontal="$4"
              height={40}
              disabled={isSearching}
            >
              <XStack alignItems="center" gap="$2">
                <Search size={16} color="white" />
                <Text color="white" fontWeight="700">
                  {isSearching ? 'Searching Listings...' : 'Search Listings'}
                </Text>
              </XStack>
            </Button>
          )}

          {selectedAreaId ? (
            <Button
              testID="delete-area-button"
              backgroundColor="#ef4444"
              hoverStyle={{ backgroundColor: '#dc2626' }}
              onPress={handleDeleteSelectedArea}
              borderRadius="$4"
              paddingHorizontal="$4"
              height={40}
            >
              <Text color="white" fontWeight="700">
                Delete Area
              </Text>
            </Button>
          ) : (
            <Button
              testID={isDrawing ? 'finish-area-button' : 'new-area-button'}
              backgroundColor={isDrawing ? '#16a34a' : '#2563eb'}
              hoverStyle={{ backgroundColor: isDrawing ? '#15803d' : '#1d4ed8' }}
              onPress={isDrawing ? handleFinishDrawing : handleStartDrawing}
              borderRadius="$4"
              paddingHorizontal="$4"
              height={40}
            >
              <Text color="white" fontWeight="700">
                {isDrawing ? 'Finish' : 'New Area'}
              </Text>
            </Button>
          )}
        </XStack>
      </XStack>

      {/* Selected Area Property Counter Badges */}
      {selectedArea && (
        <XStack gap="$3" alignItems="center">
          <XStack backgroundColor="#f1f5f9" paddingVertical="$1.5" paddingHorizontal="$3" borderRadius="$3" alignItems="center" gap="$2" borderColor="#cbd5e1" borderWidth={1}>
            <Home size={16} color="#64748b" />
            <Text fontSize={13} fontWeight="700" color="#334155">
              Search Listings: <Text color="#2563eb" fontWeight="800">{searchPropsCount}</Text>
            </Text>
          </XStack>

          <XStack backgroundColor="#fffbeb" paddingVertical="$1.5" paddingHorizontal="$3" borderRadius="$3" alignItems="center" gap="$2" borderColor="#fde68a" borderWidth={1}>
            <Home size={16} color="#d97706" />
            <Text fontSize={13} fontWeight="700" color="#92400e">
              Candidate Properties: <Text color="#d97706" fontWeight="800">{candidatePropsCount}</Text>
            </Text>
          </XStack>

          <Button
            testID="toggle-details-panel-button"
            size="$2"
            backgroundColor="#e2e8f0"
            onPress={() => setShowDetailsPanel((prev) => !prev)}
            borderRadius="$3"
          >
            <Text fontSize={12} fontWeight="600" color="#475569">
              {showDetailsPanel ? 'Hide Details Panel' : 'Show Details Panel'}
            </Text>
          </Button>
        </XStack>
      )}

      {/* Mode Instructions Banner */}
      {isDrawing && (
        <XStack
          testID="drawing-mode-banner"
          backgroundColor="#eff6ff"
          borderColor="#bfdbfe"
          borderWidth={1}
          borderRadius="$4"
          padding="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize={13} color="#1e40af" fontWeight="600">
            <strong>Area Selection Mode:</strong> Left-click to place polygon points. Right-click to <strong>Undo</strong> last point. Double-click to <strong>Finish & Save</strong>.
          </Text>
          <Text fontSize={12} color="#3b82f6" fontWeight="700">
            Points placed: {currentPolygon.length}
          </Text>
        </XStack>
      )}

      {/* Main Map + Collapsible Details Container */}
      <XStack flex={1} width="100%" minHeight={500} gap="$4">
        {/* Map Container */}
        <YStack
          flex={2}
          width="100%"
          minHeight={500}
          backgroundColor="#0f172a"
          borderRadius="$5"
          overflow="hidden"
          borderColor="#334155"
          borderWidth={1}
          position="relative"
          elevation="$3"
        >
          <MapServiceFactory
            center={userLocation}
            zoom={zoomLevel}
            unit={unit}
            radius={radius}
            isDrawing={isDrawing}
            savedAreas={displayedAreas}
            selectedArea={selectedArea}
            currentPolygon={currentPolygon}
            onAddPoint={handleAddPoint}
            onUndoPoint={handleUndoPoint}
            onFinishDrawing={handleFinishDrawing}
            onPropertyMarkerClick={handleTransferProperty}
          />
        </YStack>

        {/* Collapsible Area Property Details Panel */}
        {selectedArea && showDetailsPanel && (
          <YStack
            flex={1}
            minWidth={300}
            maxWidth={400}
            backgroundColor="#ffffff"
            borderRadius="$5"
            borderColor="#e2e8f0"
            borderWidth={1}
            padding="$4"
            gap="$3"
            elevation="$2"
            testID="area-details-panel"
          >
            <XStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderBottomColor="#f1f5f9" pb="$2">
              <Text fontSize={16} fontWeight="800" color="#0f172a">
                Area Listings Details
              </Text>
              <Text fontSize={12} color="#64748b" fontWeight="600">
                {searchPropsCount + candidatePropsCount} Total
              </Text>
            </XStack>

            <ScrollView flex={1} gap="$3" showsVerticalScrollIndicator={false}>
              {/* Candidate Properties Section */}
              {candidatePropsCount > 0 && (
                <YStack gap="$2" mb="$3">
                  <XStack alignItems="center" gap="$1.5">
                    <Home size={15} color="#d97706" />
                    <Text fontSize={13} fontWeight="700" color="#d97706">
                      Candidate Properties ({candidatePropsCount})
                    </Text>
                  </XStack>
                  {candidatePropsList.map((prop) => (
                    <YStack
                      key={`cand-${prop.zpid}`}
                      backgroundColor="#fffbeb"
                      borderColor="#fde68a"
                      borderWidth={1}
                      borderRadius="$3"
                      padding="$3"
                      gap="$1"
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} fontWeight="800" color="#059669">
                          ${prop.price.toLocaleString()} {prop.currency || 'CAD'}
                        </Text>
                        <XStack alignItems="center" gap="$1">
                          <Home size={12} color="#d97706" />
                          <Text fontSize={11} fontWeight="700" color="#d97706">CANDIDATE</Text>
                        </XStack>
                      </XStack>
                      <Text fontSize={12} color="#475569" fontWeight="600">
                        {prop.bedrooms || '-'} bds | {prop.bathrooms || '-'} ba | {prop.livingArea || '-'} sqft
                      </Text>
                      <Text fontSize={11} color="#64748b">
                        {prop.address.streetAddress}, {prop.address.city}
                      </Text>
                    </YStack>
                  ))}
                </YStack>
              )}

              {/* Standard Search Listings Section */}
              <YStack gap="$2">
                <XStack alignItems="center" gap="$1.5">
                  <Home size={15} color="#64748b" />
                  <Text fontSize={13} fontWeight="700" color="#334155">
                    Search Listings ({searchPropsCount})
                  </Text>
                </XStack>
                {searchPropsCount === 0 ? (
                  <YStack padding="$4" alignItems="center" justifyContent="center" backgroundColor="#f8fafc" borderRadius="$3">
                    <Text fontSize={13} color="#94a3b8" textAlign="center">
                      No property search listings found in area yet. Click "Search Properties" to search.
                    </Text>
                  </YStack>
                ) : (
                  selectedArea.properties?.map((prop) => (
                    <YStack
                      key={prop.zpid}
                      backgroundColor="#f8fafc"
                      borderColor="#e2e8f0"
                      borderWidth={1}
                      borderRadius="$3"
                      padding="$3"
                      gap="$2"
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize={14} fontWeight="800" color="#059669">
                          ${prop.price.toLocaleString()} {prop.currency || 'CAD'}
                        </Text>
                        <Text fontSize={11} color="#64748b" fontWeight="600">
                          {prop.homeType || 'CONDO'}
                        </Text>
                      </XStack>

                      <Text fontSize={12} color="#475569" fontWeight="600">
                        {prop.bedrooms || '-'} bds | {prop.bathrooms || '-'} ba | {prop.livingArea || '-'} sqft
                      </Text>
                      <Text fontSize={11} color="#64748b">
                        {prop.address.streetAddress}, {prop.address.city}
                      </Text>

                      <Button
                        testID={`transfer-button-${prop.zpid}`}
                        size="$2"
                        backgroundColor="#f59e0b"
                        hoverStyle={{ backgroundColor: '#d97706' }}
                        onPress={() => handleTransferProperty(prop, selectedArea.id)}
                        borderRadius="$2"
                        mt="$1"
                      >
                        <XStack alignItems="center" gap="$1">
                          <Home size={12} color="white" />
                          <Text fontSize={11} fontWeight="700" color="white">
                            Move to Candidates
                          </Text>
                        </XStack>
                      </Button>
                    </YStack>
                  ))
                )}
              </YStack>
            </ScrollView>
          </YStack>
        )}
      </XStack>

      {/* Area Naming Popup Modal */}
      {isNameModalOpen && (
        <YStack
          testID="area-name-modal"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(15, 23, 42, 0.6)"
          justifyContent="center"
          alignItems="center"
          zIndex={1000}
        >
          <YStack
            backgroundColor="#ffffff"
            borderRadius="$5"
            padding="$5"
            width={340}
            gap="$4"
            borderColor="#e2e8f0"
            borderWidth={1}
            elevation="$5"
          >
            <Text fontSize={18} fontWeight="800" color="#0f172a">
              Name Search Area
            </Text>
            <Text fontSize={13} color="#64748b">
              Enter a name for your search area:
            </Text>

            <Input
              testID="area-name-modal-input"
              value={modalAreaName}
              onChangeText={setModalAreaName}
              placeholder="Area Name"
              borderColor="#cbd5e1"
              height={42}
              borderRadius="$3"
            />

            <XStack justifyContent="flex-end" gap="$3">
              <Button
                testID="cancel-area-modal-button"
                backgroundColor="#e2e8f0"
                hoverStyle={{ backgroundColor: '#cbd5e1' }}
                onPress={handleCancelModal}
                borderRadius="$3"
                height={38}
              >
                <Text color="#475569" fontWeight="600">
                  Cancel
                </Text>
              </Button>
              <Button
                testID="save-area-modal-button"
                backgroundColor="#2563eb"
                hoverStyle={{ backgroundColor: '#1d4ed8' }}
                onPress={handleSaveModal}
                borderRadius="$3"
                height={38}
              >
                <Text color="white" fontWeight="700">
                  Save Area
                </Text>
              </Button>
            </XStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};

export default AreasView;
