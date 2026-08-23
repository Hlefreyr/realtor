import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { Point, SavedArea } from '../../services/map/MapProviderInterface';
import { MapServiceFactory } from '../../services/map/MapServiceFactory';

export interface AreasViewProps {
  unit?: 'kilometers' | 'miles';
  radius?: number;
  savedAreas?: SavedArea[];
  selectedAreaId?: string | null;
  onSelectArea?: (id: string | null) => void;
  onSaveArea?: (area: { name: string; polygon: Point[] }) => Promise<void> | void;
  onDeleteArea?: (id: string) => Promise<void> | void;
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
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [userLocation, setUserLocation] = useState<Point>({ lat: 37.7749, lng: -122.4194 });
  const [areasList, setAreasList] = useState<SavedArea[]>(savedAreas);

  // Modal State for Area Naming
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [modalAreaName, setModalAreaName] = useState('');
  const [pendingPolygon, setPendingPolygon] = useState<Point[]>([]);

  useEffect(() => {
    setAreasList(savedAreas);
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

  const selectedArea = selectedAreaId ? areasList.find((a) => a.id === selectedAreaId) : null;
  const displayedAreas = selectedArea ? [selectedArea] : areasList;

  return (
    <YStack testID="areas-view-container" gap="$4" width="100%" flex={1} minHeight={600} position="relative">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Text fontSize={24} fontWeight="800" color="#0f172a">
            {selectedArea ? `Area: ${selectedArea.name}` : 'Property Search Areas'}
          </Text>
          <Text fontSize={14} color="#64748b">
            {selectedArea
              ? 'Viewing single search area polygon on map.'
              : 'Select, draw, and manage target property search regions on Google Maps.'}
          </Text>
        </YStack>

        <XStack gap="$3" alignItems="center">
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

      {/* Stretch Map Container to all available visible area */}
      <YStack
        flex={1}
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
          currentPolygon={currentPolygon}
          onAddPoint={handleAddPoint}
          onUndoPoint={handleUndoPoint}
          onFinishDrawing={handleFinishDrawing}
        />
      </YStack>

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
