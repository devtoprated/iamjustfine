import { WebhookService } from './webhook.service';
import RequestWithRawBody from './requestWithRawBody.interface';
export declare class WebhookController {
    private webhookService;
    constructor(webhookService: WebhookService);
    updateStatus(request: RequestWithRawBody, res: any): Promise<void>;
}
