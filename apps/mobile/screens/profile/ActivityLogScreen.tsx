import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { getUserActivityLog } from '../../src/lib/supabase';
import { useColors, SpoonColors } from '../../src/design-system';
import Section from '../../src/components/ui/Section';
import SettingItem from '../../src/components/ui/SettingItem';

interface ActivityItemDisplay {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  timeAgo: string;
}

const formatTimeAgo = (iso: string) => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'hace segundos';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min}m`;
  const hrs = Math.floor(min / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `hace ${days}d`;
    return date.toLocaleDateString();
};

export default function ActivityLogScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ActivityItemDisplay[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await getUserActivityLog(user.id, 100);
      setItems(rows.map(r => ({
        id: r.id,
        type: r.activity_type,
        description: r.description,
        createdAt: r.created_at,
        timeAgo: formatTimeAgo(r.created_at),
      })));
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ActivityItemDisplay }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>\n      <View style={styles.row}>\n        <Text style={[styles.type, { color: colors.primary }]}>{item.type}</Text>\n        <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>{item.timeAgo}</Text>\n      </View>\n      <Text style={[styles.description, { color: colors.textPrimary }]}>{item.description}</Text>\n      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>\n    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>\n      {loading && items.length === 0 ? (
        <View style={styles.loader}>\n          <ActivityIndicator color={colors.primary} />\n        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : { padding: 16 }}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={!loading ? (
            <View style={styles.empty}>\n              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin actividad registrada todavía.</Text>\n            </View>
          ) : null}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  type: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  timeAgo: { fontSize: 12 },
  description: { fontSize: 14, marginBottom: 4 },
  timestamp: { fontSize: 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  empty: { alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
