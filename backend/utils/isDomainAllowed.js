// utils/isDomainAllowed.js
import { supabase } from '../lib/supabaseClient.js';

export async function isDomainAllowed(businessId, origin) {
  try {
    if (!origin) {
      return false;
    }
    const { data, error } = await supabase
      .from('widget_domains')
      .select('domain')
      .eq('business_id', businessId);

    if (error) {
      console.error('Error fetching widget domains:', error);
      return false;
    }

    let originHost = '';
    try {
      originHost = new URL(origin).hostname.toLowerCase();
    } catch (_) {
      return false;
    }
    const allowedDomains = data.map(row => row.domain.toLowerCase());

    return allowedDomains.includes(originHost);
  } catch (err) {
    console.error('Domain check failed:', err);
    return false;
  }
}
