import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Clock, Trash2, CreditCard as Edit, GripVertical, Flag, Target } from 'lucide-react-native';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onSetStartingPoint?: (id: string) => void;
  onSetEndPoint?: (id: string) => void;
  isStartingPoint?: boolean;
  isEndPoint?: boolean;
  isDraggable?: boolean;
  dragHandleProps?: any;
  index?: number;
}

export default function DestinationCard({
  destination,
  onEdit,
  onDelete,
  onSetStartingPoint,
  onSetEndPoint,
  isStartingPoint = false,
  isEndPoint = false,
  isDraggable = false,
  dragHandleProps,
  index,
}: DestinationCardProps) {
  const confirmDelete = () => {
    Alert.alert(
      'Conferma eliminazione',
      `Sei sicuro di voler eliminare ${destination.name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => onDelete(destination.id) },
      ]
    );
  };

  return (
    <View style={[
      styles.card, 
      isStartingPoint && styles.startingPointCard,
      isEndPoint && styles.endPointCard
    ]}>
      {isDraggable && (
        <TouchableOpacity style={styles.dragHandle} {...dragHandleProps}>
          <GripVertical size={20} color="#95a5a6" />
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        {index !== undefined && (
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
        )}
        
        {isStartingPoint && (
          <View style={styles.startingPointBadge}>
            <Flag size={14} color="#fff" />
          </View>
        )}
        
        {isEndPoint && (
          <View style={styles.endPointBadge}>
            <Target size={14} color="#fff" />
          </View>
        )}
        
        <Text style={styles.title}>{destination.name}</Text>
        
        <View style={styles.addressContainer}>
          <MapPin size={16} color="#7f8c8d" style={styles.icon} />
          <Text style={styles.address} numberOfLines={2}>
            {destination.address}
          </Text>
        </View>
        
        {destination.visitDuration && (
          <View style={styles.durationContainer}>
            <Clock size={16} color="#7f8c8d" style={styles.icon} />
            <Text style={styles.duration}>
              {destination.visitDuration} min
            </Text>
          </View>
        )}
        
        {destination.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {destination.notes}
          </Text>
        )}
      </View>
      
      <View style={styles.actions}>
        {onSetStartingPoint && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startingPointButton, isStartingPoint && styles.activeStartingPointButton]}
            onPress={() => onSetStartingPoint(destination.id)}
          >
            <Flag size={18} color={isStartingPoint ? "#fff" : "#3498db"} />
          </TouchableOpacity>
        )}
        
        {onSetEndPoint && (
          <TouchableOpacity
            style={[styles.actionButton, styles.endPointButton, isEndPoint && styles.activeEndPointButton]}
            onPress={() => onSetEndPoint(destination.id)}
          >
            <Target size={18} color={isEndPoint ? "#fff" : "#e74c3c"} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(destination)}
        >
          <Edit size={18} color="#3498db" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={confirmDelete}
        >
          <Trash2 size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  startingPointCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  endPointCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  dragHandle: {
    justifyContent: 'center',
    marginRight: 10,
    paddingRight: 10,
  },
  content: {
    flex: 1,
  },
  indexBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  startingPointBadge: {
    position: 'absolute',
    top: 0,
    left: -20,
    backgroundColor: '#27ae60',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endPointBadge: {
    position: 'absolute',
    top: 0,
    left: -20,
    backgroundColor: '#e74c3c',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  duration: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  notes: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    justifyContent: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#ecf0f1',
  },
  deleteButton: {
    backgroundColor: '#ecf0f1',
  },
  startingPointButton: {
    backgroundColor: '#ecf0f1',
  },
  activeStartingPointButton: {
    backgroundColor: '#27ae60',
  },
  endPointButton: {
    backgroundColor: '#ecf0f1',
  },
  activeEndPointButton: {
    backgroundColor: '#e74c3c',
  },
});